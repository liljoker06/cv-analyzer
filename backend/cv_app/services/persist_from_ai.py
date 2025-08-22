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
    "janv":1, "janvier":1, "févr":2, "fevr":2, "février":2,
    "mars":3, "avr":4, "avril":4, "mai":5, "juin":6, "juil":7, "juillet":7,
    "août":8, "aout":8, "sept":9, "septembre":9, "oct":10, "octobre":10,
    "nov":11, "novembre":11, "déc":12, "dec":12, "décembre":12
}
_EN_MONTHS = {
    "jan":1,"january":1,"feb":2,"february":2,"mar":3,"march":3,"apr":4,"april":4,
    "may":5,"jun":6,"june":6,"jul":7,"july":7,"aug":8,"august":8,"sep":9,"sept":9,"september":9,
    "oct":10,"october":10,"nov":11,"november":11,"dec":12,"december":12
}

def _parse_month_year(s: str) -> Optional[datetime]:
    if not s:
        return None
    ss = (s or "").strip().lower().replace("é","e").replace("è","e").replace("ê","e").replace(".", "")
    parts = ss.split()
    y = None; m = None
    for p in parts:
        if p.isdigit() and len(p) == 4:
            y = int(p); continue
        if p in _FR_MONTHS:
            m = _FR_MONTHS[p]
        elif p in _EN_MONTHS:
            m = _EN_MONTHS[p]
        else:
            if "-" in p:
                t = p.split("-")
                if len(t)==2 and t[0].isdigit() and t[1].isdigit():
                    y = int(t[0]); m = int(t[1]); break
    if y and not m: m = 1
    if y:
        try: return datetime(y, m or 1, 1)
        except Exception: return None
    if ss.isdigit() and len(ss)==4:
        try: return datetime(int(ss), 1, 1)
        except Exception: return None
    return None

def _norm_email(s: str) -> str:
    return (s or "").strip().lower()

def _safe_join(xs: List[str]) -> str:
    return ", ".join([x for x in xs if isinstance(x, str) and x.strip()])

def _split_fullname(s: str) -> tuple[str, str]:
    s = (s or "").strip()
    if not s: return "", ""
    parts = [p for p in s.split() if p]
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[-1]

def _scale_overall(score_any: Any) -> float:
    """
    Rend un score /10, en acceptant:
     - déjà /10 (ex: 8.0)  -> 8.0
     - /100  (ex: 58.7)    -> 5.87
    """
    try:
        s = float(score_any)
    except Exception:
        return 0.0
    if s <= 10.0:
        return round(max(0.0, min(10.0, s)), 2)
    # assume pourcentage
    return round(max(0.0, min(100.0, s)) / 10.0, 2)

def _to_subscore_10(x: Any) -> float:
    """convertit un ratio (0..1) vers une note /10."""
    try:
        r = float(x)
    except Exception:
        return 0.0
    return round(max(0.0, min(1.0, r)) * 10.0, 2)


def _education_score(job: JobPosting, struct: dict) -> float:
    required = (job.experience_required or "").lower()
    if not required:
        return 0.5
    for edu in struct.get("education", []):
        degree = (edu.get("degree") or "").lower()
        if required in degree:
            return 1.0
    return 0.0

# ----------------- upserts -----------------

def upsert_job(job_profile: Dict[str, Any]) -> JobPosting:
    title = (job_profile.get("title") or "").strip()
    company = (job_profile.get("company") or "").strip()
    loc = (job_profile.get("location") or "").strip()
    exp_req = (job_profile.get("experience_required") or "").strip()
    req_sk = job_profile.get("required_skills") or []
    if not isinstance(req_sk, list):
        req_sk = []
    job = JobPosting.objects(
        title=title, company=company, location=loc
    ).modify(
        upsert=True, new=True,
        set__experience_required=exp_req,
        set__required_skills=[str(s).strip().lower() for s in req_sk if s],
    )
    return job

def upsert_candidate(structured: Dict[str, Any], applied_position: str, contact_fallback: Dict[str, Any] | None = None) -> Candidate:
    contact_fallback = contact_fallback or {}

    email = _norm_email(structured.get("email") or contact_fallback.get("email"))
    # nom/prénom
    first = (structured.get("first_name") or "").strip()
    last  = (structured.get("last_name") or "").strip()

    if (not first or not last) and contact_fallback.get("full_name"):
        f, l = _split_fullname(contact_fallback["full_name"])
        first = first or f
        last  = last or l

    if not first and structured.get("full_name"):
        f, l = _split_fullname(structured["full_name"])
        first = first or f
        last  = last or l

    if not first: first = "N/A"
    if not last:  last  = "N/A"

    cand = Candidate.objects(email_lc=email).first() if email else None
    if not cand:
        cand = Candidate(
            first_name=first,
            last_name=last,
            email=structured.get("email") or email or f"unknown_{int(datetime.utcnow().timestamp())}@local",
            phone=structured.get("phone") or contact_fallback.get("phone") or "",
            applied_position=applied_position,
            skills=[str(s).strip().lower() for s in (structured.get("skills") or []) if s]
        )
    else:
        # mise à jour douce
        cand.first_name = cand.first_name or first
        cand.last_name  = cand.last_name or last
        cand.phone = cand.phone or (structured.get("phone") or contact_fallback.get("phone") or "")
        cand.applied_position = cand.applied_position or applied_position
        merged = {*(cand.skills or []), *[str(s).strip().lower() for s in (structured.get("skills") or []) if s]}
        cand.skills = sorted(merged)

    # expériences (on ajoute si vide)
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

    try:
        cand.save()
    except NotUniqueError:
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
    """
    ares = un item de payload["analysis"]["results"][i]
    - 'score' peut être soit /10 (8.0), soit /100 (58.7)
    - breakdown: skills/exp/desc/loc sont des ratios 0..1 -> convertis en /10
    - strengths/weaknesses: préférer insights.strengths/gaps, sinon matched/missing
    """
    score_any = ares.get("score", 0.0)
    overall = _scale_overall(score_any)

    br = ares.get("breakdown") or {}
    skills_s = _to_subscore_10(br.get("skills", 0.0))
    exp_s    = _to_subscore_10(br.get("exp", 0.0))
    comm_s   = _to_subscore_10(br.get("desc", 0.0))  # proxy pertinence
    culture_s= _to_subscore_10(br.get("loc", 0.0))   # proxy localisation
    edu_s = _to_subscore_10(_education_score(job, ares.get("structured", {})))

    ins = ares.get("insights") or {}
    strengths = _safe_join(ins.get("strengths") or ares.get("matched_skills") or [])
    weaknesses = _safe_join(ins.get("gaps") or ares.get("missing_skills") or [])
    verdict = (ins.get("verdict") or "").strip()

    ana = Analysis.objects(job=job, candidate=candidate).modify(
        upsert=True, new=True,
        set__overall_score=overall,
        set__skills_score=skills_s,
        set__experience_score=exp_s,
        set__education_score=edu_s,
        set__location_score=culture_s,  
        set__communication_score=comm_s,
        set__culture_score=culture_s,
        set__strengths=strengths,
        set__weaknesses=weaknesses,
        set__recommendations=verdict,
        set__status="pending"
    )
    return ana

# ----------------- API principale -----------------

def persist_from_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    payload = la réponse JSON renvoyée par ta vue (celle que tu as collée).
    On persiste:
      - JobPosting (payload.analysis.job_profile)
      - Chaque candidat (via analysis.results[*].structured/contact avec fallback)
      - Le CV (si tmp_path existe encore)
      - Analysis (scores + strengths/weaknesses/verdict)
    """
    saved: List[Dict[str, Any]] = []

    # 1) Job
    job_profile = (payload.get("analysis") or {}).get("job_profile") or {}
    job = upsert_job(job_profile)

    # 2) Map rapide original_name -> (tmp_path, structured depuis results[*] s'il existe)
    filemap: Dict[str, Dict[str, Any]] = {}
    for r in payload.get("results", []):
        filemap[r.get("original_name")] = {
            "tmp_path": r.get("tmp_path"),
            "structured": (r.get("structured") or {})  # fallback utile si ares.structured manque
        }

    # 3) Parcours des résultats d'analyse
    for ares in (payload.get("analysis") or {}).get("results", []):
        orig = ares.get("original_name") or ""
        # structured prioritaire = celui dans 'analysis', sinon fallback 'results'
        structured = (ares.get("structured") or {}) or filemap.get(orig, {}).get("structured") or {}
        contact = ares.get("contact") or {}

        # compléter les trous depuis contact
        if not structured.get("email"):
            structured["email"] = contact.get("email")
        if not structured.get("first_name") and contact.get("full_name"):
            f, _ = _split_fullname(contact["full_name"]); structured["first_name"] = f
        if not structured.get("last_name") and contact.get("full_name"):
            _, l = _split_fullname(contact["full_name"]); structured["last_name"] = l
        if not structured.get("phone"):
            structured["phone"] = contact.get("phone")

        # 3.1 Candidate
        cand = upsert_candidate(structured, applied_position=job.title, contact_fallback=contact)

        # 3.2 Attacher le CV si le fichier existe encore
        tmp = (filemap.get(orig) or {}).get("tmp_path")
        attach_cv_if_exists(cand, orig, tmp)

        # 3.3 Analysis
        ana = upsert_analysis(job, cand, ares)

        saved.append({
            "candidate_id": str(cand.id),
            "analysis_id": str(ana.id),
        })

    return {"job_id": str(job.id), "saved": saved}
