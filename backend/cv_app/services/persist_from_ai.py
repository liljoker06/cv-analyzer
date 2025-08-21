# cv_app/services/persist_from_ai.py
from __future__ import annotations
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from mongoengine import NotUniqueError

from cv_app.models.job import JobPosting
from cv_app.models.candidate import Candidate, Experience
from cv_app.models.analysis import Analysis
from cv_app.models.document import DocumentFile

# ----------------- helpers -----------------

_FR_MONTHS = {
    "janv":1, "janvier":1, "févr":2, "fevr":2, "février":2, "mars":3, "avr":4, "avril":4,
    "mai":5, "juin":6, "juil":7, "juillet":7, "août":8, "aout":8, "sept":9, "septembre":9,
    "oct":10, "octobre":10, "nov":11, "novembre":11, "déc":12, "dec":12, "décembre":12
}
_EN_MONTHS = {
    "jan":1,"january":1,"feb":2,"february":2,"mar":3,"march":3,"apr":4,"april":4,
    "may":5,"jun":6,"june":6,"jul":7,"july":7,"aug":8,"august":8,"sep":9,"sept":9,"september":9,
    "oct":10,"october":10,"nov":11,"november":11,"dec":12,"december":12
}
def _parse_month_year(s: str) -> Optional[datetime]:
    """
    Parse très tolérant: 'Septembre 2022', 'sept. 2022', 'janv. 2019', 'April 2019', '2019-06', '2019'...
    Renvoie un datetime au 1er du mois, sinon None.
    """
    if not s: 
        return None
    ss = s.strip().lower().replace("é","e").replace("è","e").replace("ê","e").replace(".", "")
    # ex: "septembre 2022"
    parts = ss.split()
    y = None; m = None
    for p in parts:
        # année ?
        if p.isdigit() and len(p) == 4:
            y = int(p); continue
        # mois FR/EN ?
        if p in _FR_MONTHS: m = _FR_MONTHS[p]
        elif p in _EN_MONTHS: m = _EN_MONTHS[p]
        else:
            # formats type "2019-06"
            if "-" in p:
                t = p.split("-")
                if len(t)==2 and t[0].isdigit() and t[1].isdigit():
                    y = int(t[0]); m = int(t[1]); break
    if y and not m: m = 1
    if y: 
        try: 
            return datetime(y, m or 1, 1)
        except Exception:
            return None
    # année seule genre "2019"
    if ss.isdigit() and len(ss)==4:
        try: return datetime(int(ss), 1, 1)
        except Exception: return None
    return None

def _norm_email(s: str) -> str:
    return (s or "").strip().lower()

def _safe_join(xs: List[str]) -> str:
    return ", ".join([x for x in xs if isinstance(x, str) and x.strip()])

# ----------------- upserts -----------------

def upsert_job(job_profile: Dict[str, Any]) -> JobPosting:
    title   = (job_profile.get("title") or "").strip()
    company = (job_profile.get("company") or "").strip()
    loc     = (job_profile.get("location") or "").strip()
    exp_req = (job_profile.get("experience_required") or "").strip()
    req_sk  = job_profile.get("required_skills") or []
    if not isinstance(req_sk, list): req_sk = []

    job = JobPosting.objects(
        title=title, company=company, location=loc
    ).modify(
        upsert=True, new=True,
        set__experience_required=exp_req,
        set__required_skills=[str(s).strip().lower() for s in req_sk if s],
    )
    return job

def upsert_candidate(structured: Dict[str, Any], applied_position: str) -> Candidate:
    email = _norm_email(structured.get("email"))
    first = (structured.get("first_name") or "").strip() or (structured.get("full_name") or "").strip().split(" ")[0] if structured.get("full_name") else ""
    last  = (structured.get("last_name") or "").strip()  or (structured.get("full_name") or "").strip().split(" ")[-1] if structured.get("full_name") else ""

    if not first: first = "N/A"
    if not last:  last  = "N/A"

    cand = Candidate.objects(email_lc=email).first() if email else None
    if not cand:
        cand = Candidate(
            first_name=first, last_name=last,
            email=structured.get("email") or email or f"unknown_{int(datetime.utcnow().timestamp())}@local",
            phone=structured.get("phone") or "",
            applied_position=applied_position,
            skills=[str(s).strip().lower() for s in (structured.get("skills") or []) if s]
        )
    else:
        # mise à jour douce
        cand.first_name = cand.first_name or first
        cand.last_name  = cand.last_name  or last
        cand.phone      = cand.phone or (structured.get("phone") or "")
        cand.applied_position = cand.applied_position or applied_position
        # merge skills
        merged = {*(cand.skills or []), *[str(s).strip().lower() for s in (structured.get("skills") or []) if s]}
        cand.skills = sorted(merged)

    # expériences (facultatif: ajoute seulement si le candidat n'en a pas déjà)
    if not cand.experiences and isinstance(structured.get("experiences"), list):
        exps: List[Experience] = []
        for e in structured["experiences"][:5]:
            exps.append(Experience(
                company_name=(e.get("company") or "").strip() or "N/A",
                role=(e.get("role") or "").strip() or "N/A",
                start_date=_parse_month_year(e.get("start_date", "")),
                end_date=_parse_month_year(e.get("end_date", "")),
                description=(e.get("description") or "")[:700]
            ))
        cand.experiences = exps

    # déclenchera .clean() pour alimenter email_lc
    try:
        cand.save()
    except NotUniqueError:
        # si course: on relis et on met à jour
        cand = Candidate.objects(email_lc=email).first()

    return cand

def attach_cv_if_exists(candidate: Candidate, original_name: str, tmp_path: str) -> Optional[DocumentFile]:
    try:
        if tmp_path and os.path.exists(tmp_path):
            doc = DocumentFile(candidate=candidate, doc_type="cv")
            with open(tmp_path, "rb") as fh:
                doc.file.put(fh, filename=original_name, content_type="application/pdf")
            doc.save()
            return doc
    except Exception:
        pass
    return None

def upsert_analysis(job: JobPosting, candidate: Candidate, ares: Dict[str, Any]) -> Analysis:
    # ares = un item de payload["analysis"]["results"][i]
    score_pct = float(ares.get("score", 0.0))          # ex: 58.7
    br = ares.get("breakdown") or {}
    w  = (br.get("weights") or {})
    # Normalisation (0..10)
    overall = round(score_pct / 10.0, 2)

    skills_s  = round(10.0 * float(br.get("skills", 0.0)), 2)
    exp_s     = round(10.0 * float(br.get("exp", 0.0)), 2)
    edu_s     = 0.0
    comm_s    = round(10.0 * float(br.get("desc", 0.0)), 2)  # on assimile "desc" à comm/pertinence de description
    culture_s = round(10.0 * float(br.get("loc", 0.0)), 2)   # proxy localisation

    ins = ares.get("insights") or {}
    strengths = _safe_join(ins.get("strengths") or [])
    gaps      = _safe_join(ins.get("gaps") or [])
    verdict   = (ins.get("verdict") or "").strip()

    ana = Analysis.objects(job=job, candidate=candidate).modify(
        upsert=True, new=True,
        set__overall_score=overall,
        set__skills_score=skills_s,
        set__experience_score=exp_s,
        set__education_score=edu_s,
        set__communication_score=comm_s,
        set__culture_score=culture_s,
        set__strengths=strengths,
        set__weaknesses=gaps,
        set__recommendations=verdict,
        set__status="pending"
    )
    return ana

# ----------------- API principale -----------------

def persist_from_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    payload = la réponse JSON que tu as montrée.
    Renvoie les IDs persistés.
    """
    saved: List[Dict[str, Any]] = []

    # 1) Job
    job_profile = (payload.get("analysis") or {}).get("job_profile") or {}
    job = upsert_job(job_profile)

    # 2) Map rapide original_name -> tmp_path (pour GridFS)
    filemap = {}
    for r in payload.get("results", []):
        filemap[r.get("original_name")] = r.get("tmp_path")

    # 3) Parcours des résultats d'analyse
    for ares in (payload.get("analysis") or {}).get("results", []):
        structured = ares.get("structured") or {}
        contact    = ares.get("contact")    or {}

        # fallback si email absent dans structured
        if not structured.get("email"):
            structured["email"] = contact.get("email")
        if not structured.get("first_name") and contact.get("full_name"):
            structured["first_name"] = contact["full_name"].split()[0]
        if not structured.get("last_name") and contact.get("full_name"):
            structured["last_name"] = contact["full_name"].split()[-1]
        if not structured.get("phone"):
            structured["phone"] = contact.get("phone")

        # 3.1 Candidate
        cand = upsert_candidate(structured, applied_position=job.title)

        # 3.2 Attacher le CV si le fichier existe encore
        orig = ares.get("original_name") or ""
        tmp  = filemap.get(orig)
        attach_cv_if_exists(cand, orig, tmp)

        # 3.3 Analysis
        ana = upsert_analysis(job, cand, ares)

        saved.append({
            "candidate_id": str(cand.id),
            "analysis_id": str(ana.id),
        })

    return {"job_id": str(job.id), "saved": saved}
