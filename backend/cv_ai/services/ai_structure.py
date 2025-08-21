# cv_ai/services/ai_structure.py
from __future__ import annotations
import os, json, re
from typing import Any, Dict, List, Union

try:
    from django.conf import settings
except Exception:
    settings = None

try:
    from huggingface_hub import InferenceClient
except Exception:
    InferenceClient = None

# ---- CONFIG (env d'abord, puis settings Django) ----
HF_API_TOKEN = os.getenv("HF_API_TOKEN") or (getattr(settings, "HF_API_TOKEN", "") if settings else "")
HF_MODEL = os.getenv("HF_MODEL") or (getattr(settings, "HF_MODEL", "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B") if settings else "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B")
# mets 800 pour éviter les coupures sur JSON
HF_MAX_NEW_TOKENS = int(os.getenv("HF_MAX_NEW_TOKENS") or (getattr(settings, "HF_MAX_NEW_TOKENS", 800) if settings else 800))

JSON_SCHEMA_HINT: Dict[str, Any] = {
    "full_name": "", "first_name": "", "last_name": "",
    "email": "", "phone": "", "location": "",
    "links": [], "summary": "",
    "skills": [], "languages": [], "tools": [],
    "experiences": [{
        "company": "", "role": "", "start_date": "", "end_date": "",
        "duration": "", "location": "", "description": "", "achievements": []
    }],
    "education": [{
        "degree": "", "school": "", "start_date": "",
        "end_date": "", "grade": "", "location": ""
    }],
    "certifications": [{"name": "", "issuer": "", "year": ""}],
    "projects": [{"name": "", "role": "", "stack": [], "description": "", "year": ""}]
}

SYSTEM_MSG_STRICT = (
    "You are a multilingual CV parser. "
    "Your ONLY task is to output a STRICT JSON object with the required keys. "
    "NO explanations, NO markdown, NO code fences—ONLY JSON. "
    "If a field is missing, use empty string \"\" or empty array []. "
    "Do NOT translate; keep original strings. "
    "Keep it concise: arrays max 5 items; descriptions <= 40 words; experiences max 3 items."
)

USER_TEMPLATE = """Extract fields from the CV text and output ONLY a valid JSON object.
No code fences. No extra text.

CV TEXT:
\"\"\"{cv_text}\"\"\"

Return JSON with this exact shape (all keys must exist):
{json_schema}
"""

USER_TEMPLATE_STRICT = """Return ONLY a valid JSON object starting at the first character and ending at the last.
No markdown, no backticks, no explanations.
Keep arrays <= 5 items, descriptions <= 40 words, experiences <= 3.

Schema (keys must exist exactly):
{json_schema}

CV TEXT:
\"\"\"{cv_text}\"\"\""""

# ---------- helpers ----------
def _hf_client():
    if InferenceClient is None:
        raise RuntimeError("Installe huggingface_hub: pip install huggingface_hub")
    if not HF_API_TOKEN:
        raise RuntimeError("HF_API_TOKEN manquant dans l'environnement.")
    return InferenceClient(model=HF_MODEL, token=HF_API_TOKEN, timeout=60)

def _strip_noise(s: str) -> str:
    if not s:
        return ""
    s2 = s.strip()
    s2 = s2.replace("```json", "").replace("```JSON", "").replace("```", "")
    s2 = s2.replace("<think>", "").replace("</think>", "")
    return s2.strip()

def _content_to_text(content: Union[str, List[Any], None]) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: List[str] = []
        for c in content:
            if isinstance(c, dict):
                if "text" in c and isinstance(c["text"], str):
                    parts.append(c["text"])
                elif "content" in c and isinstance(c["content"], str):
                    parts.append(c["content"])
            elif isinstance(c, str):
                parts.append(c)
        return "\n".join([p for p in parts if p])
    return ""

def _extract_chat_text(resp: Any) -> str:
    # Hugging Face chat_completion renvoie souvent un dict avec "choices"
    choices = None
    if isinstance(resp, dict):
        choices = resp.get("choices", [])
    else:
        choices = getattr(resp, "choices", None)

    if not choices:
        if isinstance(resp, dict):
            gt = resp.get("generated_text")
            if gt: return str(gt)
        else:
            gt = getattr(resp, "generated_text", None)
            if gt: return str(gt)
        return ""

    first = choices[0]
    msg = first.get("message") if isinstance(first, dict) else getattr(first, "message", None)
    if msg:
        content = msg.get("content") if isinstance(msg, dict) else getattr(msg, "content", "")
        return _content_to_text(content)
    if isinstance(first, dict) and "text" in first:
        return str(first.get("text", ""))
    t = getattr(first, "text", None)
    if isinstance(t, str):
        return t
    return ""

def _json_from_text_relaxed(s: str) -> Dict[str, Any]:
    """Essaye d'extraire le premier JSON équilibré depuis le 1er '{'."""
    if not s:
        return {}
    s2 = _strip_noise(s)
    start = s2.find("{")
    if start == -1:
        return {}
    depth = 0
    in_str = False
    esc = False
    last_valid = None
    for i in range(start, len(s2)):
        ch = s2[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    candidate = s2[start:i+1]
                    try:
                        obj = json.loads(candidate)
                        last_valid = obj
                        # continue à chercher au cas où il y a plusieurs JSON, on garde le 1er complet
                        return obj
                    except Exception:
                        pass
    # si jamais on a rien trouvé mais on a peut-être un JSON presque complet (tronqué),
    # on ne tente pas de “deviner”; on restera sur {}
    return last_valid or {}

def _repair_payload(d: Dict[str, Any]) -> Dict[str, Any]:
    d = d if isinstance(d, dict) else {}
    for k, v in JSON_SCHEMA_HINT.items():
        if isinstance(v, list): d.setdefault(k, [])
        elif isinstance(v, dict): d.setdefault(k, {})
        else: d.setdefault(k, "")
    for k in ("full_name","first_name","last_name","email","phone","location","summary"):
        v = d.get(k, ""); d[k] = v if isinstance(v, str) else ("" if v is None else str(v))

    def _list_str(xs, lower=False):
        if not isinstance(xs, list): return []
        out, seen = [], set()
        for v in xs:
            if isinstance(v, str):
                t = v.strip().lower() if lower else v.strip()
                if t and t not in seen:
                    seen.add(t); out.append(t)
        return out

    d["links"] = _list_str(d.get("links"))
    d["skills"] = _list_str(d.get("skills"), lower=True)
    d["languages"] = _list_str(d.get("languages"), lower=True)
    d["tools"] = _list_str(d.get("tools"), lower=True)

    def _list_obj(xs, keys):
        if not isinstance(xs, list): return []
        out = []
        for e in xs:
            if isinstance(e, dict):
                obj = {}
                for k in keys:
                    val = e.get(k, "")
                    obj[k] = val if isinstance(val, (list, dict)) else ("" if val is None else str(val))
                out.append(obj)
        return out

    d["experiences"] = _list_obj(d.get("experiences"),
                                 ["company","role","start_date","end_date","duration","location","description","achievements"])
    for e in d["experiences"]:
        ach = e.get("achievements", [])
        if not isinstance(ach, list):
            e["achievements"] = [] if not ach else [str(ach)]
        else:
            e["achievements"] = [str(x) for x in ach if isinstance(x, (str,int,float))]

    d["education"] = _list_obj(d.get("education"),
                               ["degree","school","start_date","end_date","grade","location"])
    d["certifications"] = _list_obj(d.get("certifications"),
                                    ["name","issuer","year"])
    d["projects"] = _list_obj(d.get("projects"),
                              ["name","role","stack","description","year"])
    for p in d["projects"]:
        st = p.get("stack", [])
        if not isinstance(st, list):
            p["stack"] = [] if not st else [str(st).strip().lower()]
        else:
            p["stack"] = [str(x).strip().lower() for x in st if isinstance(x, (str,int,float))]
    return d

# --------- pré-nettoyage LLM & post-enrichissement ---------
EMAIL_LOOSE = re.compile(
    r'[A-Za-z0-9._%+\-]+(?:\s*[\.]\s*[A-Za-z0-9._%+\-]+)*\s*@\s*[A-Za-z0-9.\-]+\s*\.\s*[A-Za-z]{2,}',
    re.IGNORECASE
)
LINKEDIN_LOOSE = re.compile(
    r'(?:https?://)?(?:www\.)?(?:link\s*ed\s*in|linkedin)\s*\.\s*com\S*',
    re.IGNORECASE
)
PHONE_LOOSE = re.compile(r'(?:\+?\d[\s\.\-\(\)]?){9,15}')

def _compact_spaces_inside_email(s: str) -> str:
    return re.sub(r'\s+', '', s)

def _compact_domain_spaces(s: str) -> str:
    s2 = re.sub(r'link\s*ed\s*in', 'linkedin', s, flags=re.IGNORECASE)
    s2 = re.sub(r'\s*\.\s*', '.', s2)
    return s2

def _preclean_raw_for_llm(text: str) -> str:
    if not text:
        return text
    def _fix_email(m): return _compact_spaces_inside_email(m.group(0))
    text = EMAIL_LOOSE.sub(_fix_email, text)
    def _fix_linkedin(m): return _compact_domain_spaces(m.group(0))
    text = LINKEDIN_LOOSE.sub(_fix_linkedin, text)
    return text

def _normalize_phone_fr(s: str) -> str:
    digits = re.sub(r'[^\d+]', '', s)
    digits = re.sub(r'^\+33\s*0', '+33', digits)
    if digits.startswith('0') and len(re.sub(r'\D', '', digits)) >= 9:
        digits = '+33' + digits[1:]
    return digits

def _post_enrich_from_raw(structured: dict, raw_text: str) -> dict:
    out = dict(structured or {})
    email_ok = isinstance(out.get('email'), str) and '@' in out['email'] and ' ' not in out['email']
    if not email_ok:
        m = EMAIL_LOOSE.search(raw_text or '')
        if m:
            out['email'] = _compact_spaces_inside_email(m.group(0))
    need_phone = not isinstance(out.get('phone'), str) or len(out.get('phone', '').strip()) < 6
    if need_phone:
        m = PHONE_LOOSE.search(raw_text or '')
        if m:
            out['phone'] = _normalize_phone_fr(m.group(0))
    links = out.get('links') if isinstance(out.get('links'), list) else []
    has_linkedin = any('linkedin.com' in (l or '').lower() for l in links)
    if not has_linkedin:
        m = LINKEDIN_LOOSE.search(raw_text or '')
        if m:
            ll = _compact_domain_spaces(m.group(0))
            if not ll.lower().startswith('http'):
                ll = 'https://' + ll.lstrip('/')
            if ll not in links:
                links.append(ll)
            out['links'] = links
    if not out.get('first_name') and not out.get('last_name') and out.get('full_name'):
        parts = [p for p in out['full_name'].strip().split() if p]
        if len(parts) >= 2:
            out['first_name'] = parts[0]
            out['last_name']  = parts[-1]
    return out

# ---------- appel HF : chat uniquement (2 tentatives) ----------
def _call_hf_chat(prompt_user: str, max_tokens: int) -> str:
    client = _hf_client()
    try:
        resp = client.chat_completion(
            messages=[
                {"role": "system", "content": SYSTEM_MSG_STRICT},
                {"role": "user", "content": prompt_user},
            ],
            max_tokens=max_tokens,
            temperature=0.0,
            top_p=1.0,
            stream=False,
            stop=["```"]
        )
        return _extract_chat_text(resp)
    except Exception as e:
        print(f"[ai_structure] chat_completion failed: {e}")
        return ""

def _call_hf_json(cv_text: str) -> Dict[str, Any]:
    jschema = json.dumps(JSON_SCHEMA_HINT, ensure_ascii=False)

    # tentative 1 (prompt normal)
    txt = _call_hf_chat(
        USER_TEMPLATE.format(cv_text=cv_text or "", json_schema=jschema),
        max_tokens=HF_MAX_NEW_TOKENS
    )
    data = _json_from_text_relaxed(txt)
    if data:
        return _repair_payload(data)
    else:
        if txt:
            print("[ai_structure] warn: try1 produced non-JSON, head:", _strip_noise(txt)[:160].replace("\n"," "))
        else:
            print("[ai_structure] warn: try1 produced EMPTY content")

    # tentative 2 (prompt strict + +20% tokens si possible)
    max2 = int(HF_MAX_NEW_TOKENS * 1.2)
    txt2 = _call_hf_chat(
        USER_TEMPLATE_STRICT.format(cv_text=cv_text or "", json_schema=jschema),
        max_tokens=max2
    )
    data2 = _json_from_text_relaxed(txt2)
    if data2:
        return _repair_payload(data2)
    else:
        if txt2:
            print("[ai_structure] warn: try2 produced non-JSON, head:", _strip_noise(txt2)[:160].replace("\n"," "))
        else:
            print("[ai_structure] warn: try2 produced EMPTY content")

    # si tout échoue
    return _repair_payload({})

# ---------- API ----------
def structure_one_raw_text(raw_text: str) -> Dict[str, Any]:
    cleaned = _preclean_raw_for_llm((raw_text or "").strip())
    data = _call_hf_json(cleaned)
    return _post_enrich_from_raw(data, raw_text or "")

def structure_batch_from_extraction(batch: Dict[str, Any]) -> Dict[str, Any]:
    results_in = batch.get("results", []) if isinstance(batch, dict) else []
    out: List[Dict[str, Any]] = []
    for item in results_in:
        try:
            original = item.get("original_name", "")
            raw_text = ((item.get("parsed") or {}).get("raw_text")) or ""
            structured = structure_one_raw_text(raw_text)
            out.append({"original_name": original, "structured": structured, "status": "ok"})
        except Exception as e:
            out.append({"original_name": item.get("original_name",""), "structured": _repair_payload({}), "status": "error", "error": str(e)})
    return {"count": len(out), "results": out}
