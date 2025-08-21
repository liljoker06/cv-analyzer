import json, re
from typing import Dict, List, Any
from decouple import config


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\s\-().]{7,})")

def _guess_email(text: str) -> str:
    m = EMAIL_RE.search(text); return m.group(0) if m else ""

def _guess_phone(text: str) -> str:
    m = PHONE_RE.search(text); return m.group(0).strip() if m else ""

def _safe_json_extract(s: str) -> Dict[str, Any]:
    """Arrache le premier bloc JSON plausible dans s, sinon {}."""
    start = s.find("{"); end = s.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(s[start:end+1])
        except Exception:
            return {}
    return {}

def _compact_list(xs) -> List[str]:
    out = []
    if isinstance(xs, list):
        for v in xs:
            if isinstance(v, str):
                t = v.strip().lower()
                if t: out.append(t)
    return sorted(list({*out}))

def _compute_scores(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, float]:
    req = [s.strip().lower() for s in (required_skills or []) if s and s.strip()]
    cand = [s.strip().lower() for s in (candidate_skills or []) if s and s.strip()]
    if not req:
        skills = 5.0
    else:
        overlap = len(set(req) & set(cand))
        skills = round(10.0 * overlap / max(1, len(req)), 1)
    # placeholders (remplacer plus tard par embeddings sémantiques)
    experience = education = communication = culture = 5.0
    overall = round(0.5*skills + 0.125*(experience+education+communication+culture), 1)
    return {
        "skills_score": skills,
        "experience_score": experience,
        "education_score": education,
        "communication_score": communication,
        "culture_score": culture,
        "overall_score": overall,
    }

_PROMPT_T5 = """You are a CV information extractor. Return STRICTLY a JSON object only.
The CV can be in French or English. Extract:
- full_name (string)
- email (string)
- phone (string)
- skills (array of strings; lowercase)
- experiences (array of objects: {{company, role, years}})
- education (array of strings)
- summary (string)
Use domain-agnostic understanding (any sector). Do not add commentary.

Job title: "{job_title}"
Required skills: {required_skills}

CV:
\"\"\"{cv_text}\"\"\""""

_PROMPT_CAUSAL = """You are a CV information extractor. Return STRICTLY a JSON object and nothing else.
The CV may be in French or English. Extract:
- full_name (string)
- email (string)
- phone (string)
- skills (array of strings; lowercase)
- experiences (array of objects: {"company": string, "role": string, "years": string})
- education (array of strings)
- summary (string)

Job title: "{job_title}"
Required skills: {required_skills}

CV:
\"\"\"{cv_text}\"\"\"

JSON:
"""

def _call_model(pipe, mode: str, prompt: str, max_new: int) -> str:
    if mode == "t5":
        return pipe(prompt, max_new_tokens=max_new)[0]["generated_text"]
    # causal LM
    return pipe(prompt, max_new_tokens=max_new, do_sample=False)[0]["generated_text"]

def _repair_json_like(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Defaults robustes + normalisations simples."""
    if not isinstance(payload, dict): payload = {}
    payload.setdefault("full_name", "")
    payload["email"] = (payload.get("email") or "").strip()
    payload["phone"] = (payload.get("phone") or "").strip()
    payload["skills"] = _compact_list(payload.get("skills"))
    payload.setdefault("experiences", payload.get("experiences") or [])
    payload.setdefault("education", payload.get("education") or [])
    payload["summary"] = (payload.get("summary") or "").strip()
    return payload

def analyze_cv_text(cv_text: str, job_title: str, required_skills: List[str]) -> Dict:
    """
    Multi-modèles HF (fallback): on essaye chaque modèle jusqu'à obtenir un JSON exploitable.
    Extraction FR/EN, tous secteurs. Scoring simple par recouvrement pour l’instant.
    """
    from .registry import get_generators
    snippet = (cv_text or "")[:8000]
    max_new = int(config("HF_MAX_NEW_TOKENS", default=512))
    allow_repair = bool(int(config("LLM_JSON_FALLBACK", default=1)))

    last_payload = {}
    for model_name, pipe, mode in get_generators():
        try:
            prompt = (_PROMPT_T5 if mode == "t5" else _PROMPT_CAUSAL).format(
                job_title=job_title, required_skills=required_skills, cv_text=snippet
            )
            out = _call_model(pipe, mode, prompt, max_new)
            payload = _safe_json_extract(out)
            if not payload and allow_repair:
                # petite tentative soft: parfois le modèle met des backticks/texte avant-après
                payload = _safe_json_extract(out.replace("```json", "").replace("```", ""))
            payload = _repair_json_like(payload)
            # si on a au moins email ou skills, on considère ok
            if payload.get("email") or payload.get("skills"):
                last_payload = payload
                break
            last_payload = payload
        except Exception:
            continue

    # Fallback heuristique si rien d’utile
    if not last_payload:
        last_payload = _repair_json_like({})
    if not last_payload.get("email"):
        last_payload["email"] = _guess_email(cv_text)
    if not last_payload.get("phone"):
        last_payload["phone"] = _guess_phone(cv_text)

    scores = _compute_scores(last_payload.get("skills", []), required_skills or [])
    return {
        "full_name": last_payload.get("full_name", ""),
        "email": last_payload.get("email", ""),
        "phone": last_payload.get("phone", ""),
        "skills": last_payload.get("skills", []),
        "experiences": last_payload.get("experiences", []),
        "education": last_payload.get("education", []),
        "summary": last_payload.get("summary", ""),
        **scores,
    }
