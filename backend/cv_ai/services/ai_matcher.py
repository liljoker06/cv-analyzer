from __future__ import annotations
import os, json, re, hashlib, unicodedata
from typing import Any, Dict, List, Optional, Tuple

# --- HF optionnel (pour insights LLM) ---
try:
    from django.conf import settings
except Exception:
    settings = None

try:
    from huggingface_hub import InferenceClient
except Exception:
    InferenceClient = None

HF_API_TOKEN = os.getenv("HF_API_TOKEN") or (getattr(settings, "HF_API_TOKEN", "") if settings else "")
HF_MODEL = os.getenv("HF_MODEL") or (getattr(settings, "HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.3") if settings else "mistralai/Mistral-7B-Instruct-v0.3")
HF_MAX_NEW_TOKENS = int(os.getenv("HF_MAX_NEW_TOKENS") or (getattr(settings, "HF_MAX_NEW_TOKENS", 600) if settings else 600))

# --- pondérations (surchageables par .env) ---
W_EDU    = float(os.getenv("MATCHER_EDU_WEIGHT", "0.1"))  
W_SKILLS = float(os.getenv("MATCHER_SKILL_WEIGHT", "0.5"))
W_DESC   = float(os.getenv("MATCHER_DESC_WEIGHT", "0.3"))
W_EXP    = float(os.getenv("MATCHER_EXP_WEIGHT", "0.15"))
W_LOC    = float(os.getenv("MATCHER_LOC_WEIGHT", "0.05"))




# ------------- utilitaires texte -------------
def _strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if unicodedata.category(c) != "Mn")

WORD_RE = re.compile(r"[a-z0-9#+\-\.]{2,}")
def _tokens(s: str) -> List[str]:
    s2 = _strip_accents((s or "").lower())
    return WORD_RE.findall(s2)

def _to_set(xs: List[str]) -> set:
    return set([x.strip().lower() for x in xs if isinstance(x, str) and x.strip()])

def _years_required(desc: str, exp_field: str) -> Optional[float]:
    # extrait "3-5 ans", "3 à 5 ans", "4 ans", "5 years"
    txt = " ".join([desc or "", exp_field or ""]).lower()
    txt = txt.replace("à", "-").replace("to", "-")
    m = re.search(r"(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(ans|years)", txt)
    if m:
        a, b = float(m.group(1)), float(m.group(2))
        return (a + b) / 2.0
    m = re.search(r"(\d+(?:\.\d+)?)\s*(ans|years)", txt)
    if m:
        return float(m.group(1))
    return None

def _years_in_cv(raw_text: str, experiences: List[Dict[str, Any]]) -> Optional[float]:
    # heuristique simple : max nombre avant "ans/years" dans le texte
    best = None
    for m in re.finditer(r"(\d+(?:\.\d+)?)\s*(ans|years)", (raw_text or "").lower()):
        v = float(m.group(1))
        best = max(best or v, v)
    # si des durées explicites existent déjà, on pourrait améliorer ici
    return best

def _jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    inter = len(a & b)
    union = len(a | b)
    return inter / union if union else 0.0

def _candidate_id(structured: Dict[str, Any]) -> str:
    key = (structured.get("email") or "").strip().lower()
    if not key:
        key = (structured.get("full_name") or (structured.get("first_name","")+" "+structured.get("last_name","")) + (structured.get("phone") or "")).lower()
    h = hashlib.sha1(key.encode("utf-8")).hexdigest()
    return h[:12]

# ---------- IA (insights) ----------
SYSTEM_MSG = (
    "Tu es un assistant d'analyse de matching de CV. "
    "Renvoye UNIQUEMENT du JSON strict. Pas de markdown, pas d'explications hors JSON."
)
INSIGHT_SCHEMA = {
    "strengths": [],
    "gaps": [],
    "verdict": ""
}
USER_TEMPLATE = """Analyse la correspondance entre la fiche de poste et le candidat.
Rends UNIQUEMENT un JSON avec les clés: strengths[] (max 5), gaps[] (max 5), verdict (<= 40 mots).

Fiche de poste (titre, exigences, compétences requises):
\"\"\"{job_text}\"\"\"

Candidat (champs principaux du CV structuré):
\"\"\"{cand_text}\"\"\"

Schéma JSON attendu:
{schema}
"""

def _hf_client():
    if InferenceClient is None:
        raise RuntimeError("Installe huggingface_hub: pip install huggingface_hub")
    if not HF_API_TOKEN:
        raise RuntimeError("HF_API_TOKEN manquant dans l'environnement.")
    return InferenceClient(model=HF_MODEL, token=HF_API_TOKEN, timeout=60)

def _extract_chat_text(resp: Any) -> str:
    # aligné sur ai_structure
    if isinstance(resp, dict):
        choices = resp.get("choices") or []
        if choices:
            msg = choices[0].get("message")
            if msg and isinstance(msg, dict):
                content = msg.get("content")
                if isinstance(content, str): return content
                if isinstance(content, list):
                    out = []
                    for c in content:
                        if isinstance(c, dict) and isinstance(c.get("text"), str):
                            out.append(c["text"])
                    return "\n".join(out)
        if resp.get("generated_text"):
            return str(resp["generated_text"])
    return ""

def _json_from_text(s: str) -> Dict[str, Any]:
    if not s: return {}
    s2 = s.strip().replace("```json", "").replace("```JSON","").replace("```","").replace("<think>","").replace("</think>","")
    a, b = s2.find("{"), s2.rfind("}")
    if a >= 0 and b > a:
        try:
            return json.loads(s2[a:b+1])
        except Exception:
            return {}
    return {}

def _insights_llm(job: Dict[str, Any], cand: Dict[str, Any]) -> Dict[str, Any]:
    try:
        client = _hf_client()
    except Exception as e:
        # pas d'HF configuré -> pas d'insights
        return {"strengths": [], "gaps": [], "verdict": ""}

    job_text = json.dumps({
        "title": job.get("title",""),
        "company": job.get("company",""),
        "location": job.get("location",""),
        "experience_required": job.get("experience_required",""),
        "description": job.get("description",""),
        "required_skills": job.get("required_skills",[])
    }, ensure_ascii=False)

    cand_text = json.dumps({
        "full_name": cand.get("full_name") or (cand.get("first_name","")+" "+cand.get("last_name","")).strip(),
        "email": cand.get("email",""),
        "phone": cand.get("phone",""),
        "location": cand.get("location",""),
        "skills": cand.get("skills",[]),
        "languages": cand.get("languages",[]),
        "tools": cand.get("tools",[]),
        "experiences": cand.get("experiences",[])[:3],
        "education": cand.get("education",[])
    }, ensure_ascii=False)

    prompt = USER_TEMPLATE.format(
        job_text=job_text,
        cand_text=cand_text,
        schema=json.dumps(INSIGHT_SCHEMA, ensure_ascii=False)
    )
    try:
        resp = client.chat_completion(
            messages=[
                {"role": "system", "content": SYSTEM_MSG},
                {"role": "user", "content": prompt},
            ],
            max_tokens=min(400, HF_MAX_NEW_TOKENS),
            temperature=0.0,
            top_p=1.0,
            stream=False,
            stop=["```", "<think>", "</think>"]
        )
        txt = _extract_chat_text(resp)
        data = _json_from_text(txt) or {}
        # petite réparation souple
        strengths = data.get("strengths") if isinstance(data.get("strengths"), list) else []
        gaps = data.get("gaps") if isinstance(data.get("gaps"), list) else []
        verdict = data.get("verdict") if isinstance(data.get("verdict"), str) else ""
        return {"strengths": strengths[:5], "gaps": gaps[:5], "verdict": verdict[:400]}
    except Exception as e:
        print(f"[ai_matcher] insights LLM failed: {e}")
        return {"strengths": [], "gaps": [], "verdict": ""}

# --------- cœur du scoring ----------
def _prepare_job_keywords(job: Dict[str, Any]) -> Tuple[set, set]:
    req_sk = _to_set(job.get("required_skills", []) or [])
    desc_tokens = set(_tokens(" ".join([
        job.get("title",""), job.get("description",""), " ".join(list(req_sk))
    ])))
    return req_sk, desc_tokens

def _prepare_cv_sets(struct: Dict[str, Any]) -> Tuple[set, set]:
    skills = _to_set(struct.get("skills", []) or [])
    tools  = _to_set(struct.get("tools", []) or [])
    langs  = _to_set(struct.get("languages", []) or [])
    bag = set(_tokens(" ".join([
        " ".join(struct.get("skills",[])),
        " ".join(struct.get("tools",[])),
        " ".join(struct.get("languages",[])),
        " ".join([ (e.get("role","")+" "+e.get("description","")) for e in (struct.get("experiences") or []) ]),
        struct.get("summary","")
    ])))
    return (skills | tools | langs), bag

def _location_score(job_loc: str, cv_loc: str) -> float:
    if not job_loc or not cv_loc: 
        return 0.0
    j = set(_tokens(job_loc))
    c = set(_tokens(cv_loc))
    return 1.0 if j & c else 0.0

def _education_score(job: Dict[str, Any], struct: Dict[str, Any]) -> float:
    """
    Compare les diplômes du candidat avec ceux attendus dans le job.
    - Si le job ne précise rien : score neutre 0.5
    - Si le diplôme requis est trouvé dans le CV : 1.0
    - Sinon : 0.0
    """
    required = (job.get("required_degree") or job.get("education_required") or "").lower()
    if not required:
        return 0.5
    for edu in struct.get("education", []):
        degree = (edu.get("degree") or "").lower()
        if required in degree:
            return 1.0
    return 0.0

def score_one_candidate(
    job: Dict[str, Any],
    struct: Dict[str, Any],
    raw_text: Optional[str] = None
) -> Dict[str, Any]:
    req_sk, desc_kw = _prepare_job_keywords(job)
    cv_set, cv_bow = _prepare_cv_sets(struct)

    # 1) skills overlap
    matched_skills = sorted(list(req_sk & cv_set))
    missing_skills = sorted(list(req_sk - cv_set))
    skill_score = len(matched_skills)/len(req_sk) if req_sk else 0.0

    # 2) description / bag of words (Jaccard)
    desc_score = _jaccard(desc_kw, cv_bow)

    # 3) expérience (naïf)
    req_years = _years_required(job.get("description",""), job.get("experience_required","") or "")
    cv_years = _years_in_cv(raw_text or "", struct.get("experiences") or [])
    if req_years and cv_years:
        exp_score = min(cv_years / max(req_years, 0.1), 1.0)
    elif req_years and not cv_years:
        exp_score = 0.0   # on demande X ans, mais CV ne montre rien d'exploitable
    else:
        exp_score = 0.5   # neutre si rien d’exigé

    # 4) localisation
    loc_score = _location_score(job.get("location",""), struct.get("location",""))

    edu_score = _education_score(job, struct)

    # global
    total = (W_SKILLS*skill_score + W_DESC*desc_score + W_EXP*exp_score + W_LOC*loc_score + W_EDU*edu_score)
    score100 = round(100*total, 1)

    return {
        "score": score100,
        "breakdown": {
            "skills": round(skill_score, 3),
            "desc": round(desc_score, 3),
            "exp": round(exp_score, 3),
            "loc": round(loc_score, 3),
            "edu": round(edu_score, 3),
            "weights": {"skills": W_SKILLS, "desc": W_DESC, "exp": W_EXP, "loc": W_LOC}
        },
        "matched_skills": matched_skills[:20],
        "missing_skills": missing_skills[:20]
    }

# --------- API principale ----------
def analyze_candidates(
    job_profile: Dict[str, Any],
    candidates: List[Dict[str, Any]],
    *,
    top_k: int = 10,
    use_llm_insights: bool = True,
    llm_on_top_n: int = 10
) -> Dict[str, Any]:
    """
    candidates: liste d'objets {"original_name", "structured", "parsed": {"raw_text": "..."}}
    """
    out_list: List[Dict[str, Any]] = []
    for item in candidates:
        struct = item.get("structured") or {}
        raw = ((item.get("parsed") or {}).get("raw_text")) or ""
        sc = score_one_candidate(job_profile, struct, raw)
        cid = _candidate_id(struct)
        info = {
            "candidate_id": cid,
            "original_name": item.get("original_name",""),
            "contact": {
                "full_name": (struct.get("full_name") or (struct.get("first_name","")+" "+struct.get("last_name","")).strip()).strip(),
                "email": struct.get("email",""),
                "phone": struct.get("phone",""),
                "location": struct.get("location",""),
                "links": struct.get("links",[])
            },
            "score": sc["score"],
            "breakdown": sc["breakdown"],
            "matched_skills": sc["matched_skills"],
            "missing_skills": sc["missing_skills"],
            # on renvoie le struct pour affichage détaillé / sauvegarde
            "structured": struct
        }
        out_list.append(info)

    # tri
    out_list.sort(key=lambda x: x["score"], reverse=True)

    # insights IA sur top_n (optionnel)
    if use_llm_insights and out_list:
        top_n = min(llm_on_top_n, len(out_list))
        for i in range(top_n):
            try:
                info = out_list[i]
                ins = _insights_llm(job_profile, info["structured"])
                info["insights"] = ins
            except Exception as e:
                info["insights"] = {"strengths": [], "gaps": [], "verdict": ""}
                info["insights_error"] = str(e)

    return {
        "top_k": top_k,
        "job_profile": {
            "title": job_profile.get("title",""),
            "company": job_profile.get("company",""),
            "location": job_profile.get("location",""),
            "experience_required": job_profile.get("experience_required",""),
            "description": job_profile.get("description",""), 
            "required_skills": job_profile.get("required_skills",[]),
        },
        "results": out_list[:top_k]
    }

def analyze_candidates_from_parse_results(
    job_profile: Dict[str, Any],
    parse_results_payload: Dict[str, Any],
    *,
    top_k: int = 10,
    use_llm_insights: bool = True,
    llm_on_top_n: int = 10
) -> Dict[str, Any]:
    """
    Adapte directement la réponse actuelle de ton endpoint de parsing (avec 'results' et 'structured').
    """
    items = []
    for r in parse_results_payload.get("results", []):
        if r.get("status") == "ok" and isinstance(r.get("structured"), dict):
            items.append({
                "original_name": r.get("original_name",""),
                "structured": r.get("structured", {}),
                "parsed": r.get("parsed", {})
            })
    return analyze_candidates(
        job_profile, items,
        top_k=top_k, use_llm_insights=use_llm_insights, llm_on_top_n=llm_on_top_n
    )
