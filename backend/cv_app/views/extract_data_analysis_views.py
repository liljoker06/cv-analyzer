import re
import time
from datetime import datetime, timezone
from typing import Optional, List, Dict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from cv_app.models.job import JobPosting
from cv_app.models.candidate import Candidate
from cv_app.models.document import DocumentFile
from cv_app.models.analysis import Analysis

# IA (service interne)
from cv_ai.services.extractor import analyze_cv_text

# Libs d'extraction
try:
    import PyPDF2  # type: ignore
except Exception:
    PyPDF2 = None

try:
    import docx  # type: ignore
except Exception:
    docx = None


ALLOWED_CT = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


def _short(s: Optional[str], n: int = 220) -> str:
    """Aperçu court pour logs."""
    if not s:
        return ""
    s = s.replace("\n", " ").replace("\r", " ")
    return (s[:n] + "…") if len(s) > n else s


# ---------------------- Extraction utils ----------------------
def _extract_text_from_pdf(file_obj) -> str:
    if not PyPDF2:
        print("[extract] PyPDF2 indisponible → ''")
        return ""
    try:
        reader = PyPDF2.PdfReader(file_obj)
        text = "\n".join((p.extract_text() or "") for p in reader.pages)
        return text
    except Exception as e:
        print(f"[extract][pdf] erreur: {e}")
        return ""


def _extract_text_from_docx(file_obj) -> str:
    if not docx:
        print("[extract] python-docx indisponible → ''")
        return ""
    try:
        d = docx.Document(file_obj)
        return "\n".join(p.text for p in d.paragraphs)
    except Exception as e:
        print(f"[extract][docx] erreur: {e}")
        return ""


def _extract_text(uploaded) -> str:
    name = getattr(uploaded, "name", "").lower()
    ctype = getattr(uploaded, "content_type", "").lower()
    if "pdf" in name or ctype == "application/pdf":
        return _extract_text_from_pdf(uploaded)
    if name.endswith(".docx") or ctype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _extract_text_from_docx(uploaded)
    print(f"[extract] type non géré name={name} ctype={ctype} → ''")
    return ""


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\s\-().]{7,})")


def _guess_email(text: str) -> Optional[str]:
    m = EMAIL_RE.search(text)
    return m.group(0) if m else None


def _guess_phone(text: str) -> Optional[str]:
    m = PHONE_RE.search(text)
    return m.group(0).strip() if m else None


def _normalize_skills(raw: str) -> List[str]:
    if not raw:
        return []
    parts = re.split(r"[,\n;]", raw)
    return [p.strip().lower() for p in parts if p.strip()]


def _parse_skills_from_text(text: str) -> List[str]:
    # Fallback ultra-simple
    seeds = [
        "python", "django", "fastapi", "flask", "pandas", "numpy", "scikit-learn",
        "machine learning", "ml", "deep learning", "nlp", "sql", "nosql", "mongodb",
        "react", "next.js", "typescript", "javascript", "docker", "kubernetes",
        "aws", "gcp", "azure", "git", "linux", "rest", "microservices"
    ]
    low = text.lower()
    return sorted({k for k in seeds if k in low})


def _compute_scores(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, float]:
    req = [s.strip().lower() for s in required_skills if s.strip()]
    cand = [s.strip().lower() for s in candidate_skills]
    if not req:
        skills = 5.0
    else:
        overlap = len(set(req).intersection(set(cand)))
        pct = 10.0 * overlap / max(1, len(req))
        skills = round(pct, 1)

    experience = 5.0
    education = 5.0
    communication = 5.0
    culture = 5.0

    overall = round(0.5 * skills + 0.125 * (experience + education + communication + culture), 1)
    return {
        "skills_score": skills,
        "experience_score": experience,
        "education_score": education,
        "communication_score": communication,
        "culture_score": culture,
        "overall_score": overall,
    }


# ---------------------- Vue principale ----------------------
@method_decorator(csrf_exempt, name="dispatch")
class LaunchAnalysisView(APIView):
    """
    POST multipart/form-data:
      - title (requis)
      - company, location, experience_required, description
      - required_skills (CSV/ligne par ligne)
      - files[] (plusieurs PDF/DOCX)
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        t0 = time.time()
        print("=== [/api/extract/launch] START ===")
        print(f"[req] Content-Type: {request.content_type}")
        print(f"[req] Headers Accept-Language: {request.headers.get('Accept-Language')}")
        print(f"[req] POST keys: {list(request.POST.keys())}")
        print(f"[req] FILES keys: {list(request.FILES.keys())}")

        # 1) Job
        title = request.POST.get("title")
        if not title:
            print("[err] 'title' manquant dans form-data.")
            return Response({"error": "Le champ 'title' est requis."}, status=400)

        job = JobPosting(
            title=title,
            company=request.POST.get("company", ""),
            location=request.POST.get("location", ""),
            experience_required=request.POST.get("experience_required", ""),
            description=request.POST.get("description", ""),
            required_skills=_normalize_skills(request.POST.get("required_skills", "")),
            created_at=datetime.now(timezone.utc),
        ).save()
        print(f"[job] créé id={job.id} title={job.title} skills={job.required_skills}")

        # 2) Fichiers
        files = request.FILES.getlist("files") or request.FILES.getlist("files[]")
        print(f"[files] count={len(files)}")
        if not files:
            print("[err] aucun fichier reçu (files[]).")
            return Response({"error": "Aucun fichier fourni (paramètre files[])."}, status=400)

        processed, skipped = [], []

        for idx, f in enumerate(files, 1):
            name = getattr(f, "name", "?")
            size = getattr(f, "size", None)
            ctype = getattr(f, "content_type", None)
            print(f"\n[file#{idx}] name={name} size={size} ctype={ctype}")

            try:
                if size and size > MAX_SIZE:
                    reason = "file too large"
                    print(f"[skip] {name}: {reason}")
                    skipped.append({"filename": name, "reason": reason})
                    continue
                if ctype not in ALLOWED_CT:
                    reason = "unsupported content-type"
                    print(f"[skip] {name}: {reason}")
                    skipped.append({"filename": name, "reason": reason})
                    continue

                # 3) Extraction texte
                text = _extract_text(f)
                print(f"[extract] len={len(text)} preview='{_short(text)}'")
                try:
                    f.seek(0)
                except Exception:
                    pass

                email = _guess_email(text)
                phone = _guess_phone(text)
                print(f"[parse] email={email} phone={phone}")

                # 4) IA (multi-secteur)
                ai_res = None
                try:
                    locale = (request.headers.get("Accept-Language") or "fr").split(",")[0].strip().lower()
                    ai_res = analyze_cv_text(
                        cv_text=text,
                        job_title=job.title,
                        required_skills=job.required_skills,
                        locale=locale,
                    )
                    print(f"[ai] ok skills={len(ai_res.get('skills', []))} "
                          f"overall={ai_res.get('scores', {}).get('overall')}")
                except Exception as e:
                    print(f"[ai] erreur: {e}")

                skills_from_text = (
                    (ai_res.get("skills") if ai_res else None) or _parse_skills_from_text(text)
                )
                print(f"[skills] detected={skills_from_text}")

                if not email:
                    reason = "email not found in CV"
                    print(f"[skip] {name}: {reason}")
                    skipped.append({"filename": name, "reason": reason})
                    continue

                # 5) Upsert Candidat
                cand = Candidate.objects(email=email).first()
                created = False
                if not cand:
                    cand = Candidate(
                        first_name="",
                        last_name="",
                        email=email,
                        phone=phone or "",
                        applied_position=job.title,
                        skills=skills_from_text,
                        created_at=datetime.now(timezone.utc),
                    ).save()
                    created = True
                else:
                    changed = False
                    if (not cand.phone) and phone:
                        cand.phone = phone
                        changed = True
                    merged = sorted(set((cand.skills or []) + skills_from_text))
                    if merged != (cand.skills or []):
                        cand.skills = merged
                        changed = True
                    if changed:
                        cand.save()
                print(f"[candidate] id={cand.id} created={created} skills={cand.skills}")

                # 6) Stockage document
                doc = DocumentFile(candidate=cand, doc_type="cv")
                doc.file.put(
                    f, filename=getattr(f, "name", "upload"),
                    content_type=getattr(f, "content_type", None),
                )
                doc.save()
                print(f"[document] id={doc.id} saved")

                # 7) Scores (IA → fallback)
                if ai_res and isinstance(ai_res.get("scores"), dict):
                    s = ai_res["scores"]
                    scores = {
                        "skills_score": float(s.get("skills", 5.0)),
                        "experience_score": float(s.get("experience", 5.0)),
                        "education_score": float(s.get("education", 5.0)),
                        "communication_score": float(s.get("communication", 5.0)),
                        "culture_score": float(s.get("culture", 5.0)),
                        "overall_score": float(s.get("overall", 5.0)),
                    }
                    strengths_text = ", ".join(ai_res.get("strengths", []))
                    weaknesses_text = ", ".join(ai_res.get("weaknesses", []))
                    recommendations_text = ", ".join(ai_res.get("recommendations", []))
                else:
                    scores = _compute_scores(cand.skills or [], job.required_skills)
                    strengths_text = "Compétences détectées : " + ", ".join((cand.skills or [])[:10])
                    weaknesses_text = "À affiner via IA."
                    recommendations_text = "Vérifier adéquation soft skills."
                print(f"[scores] {scores}")

                # 8) Upsert Analyse
                ana = Analysis.objects(job=job, candidate=cand).first()
                created_ana = False
                if not ana:
                    ana = Analysis(
                        job=job,
                        candidate=cand,
                        overall_score=scores["overall_score"],
                        skills_score=scores["skills_score"],
                        experience_score=scores["experience_score"],
                        education_score=scores["education_score"],
                        communication_score=scores["communication_score"],
                        culture_score=scores["culture_score"],
                        strengths=strengths_text,
                        weaknesses=weaknesses_text,
                        recommendations=recommendations_text,
                        analyzed_at=datetime.now(timezone.utc),
                        status="pending",
                    ).save()
                    created_ana = True
                else:
                    ana.overall_score = scores["overall_score"]
                    ana.skills_score = scores["skills_score"]
                    ana.experience_score = scores["experience_score"]
                    ana.education_score = scores["education_score"]
                    ana.communication_score = scores["communication_score"]
                    ana.culture_score = scores["culture_score"]
                    ana.strengths = strengths_text
                    ana.weaknesses = weaknesses_text
                    ana.recommendations = recommendations_text
                    ana.analyzed_at = datetime.now(timezone.utc)
                    ana.save()
                print(f"[analysis] id={ana.id} created={created_ana} overall={ana.overall_score}")

                processed.append({
                    "candidate_id": str(cand.id),
                    "document_id": str(doc.id),
                    "email": cand.email,
                    "score": ana.overall_score,
                })

            except Exception as e:
                print(f"[error] file={name} err={e}")
                skipped.append({"filename": name, "reason": str(e)})

        # 9) Stats + Top 10 + Insights
        analyses = Analysis.objects(job=job).order_by("-overall_score")
        top10 = analyses[:10]

        n = analyses.count()
        avg = round(sum(a.overall_score for a in analyses) / max(1, n), 1)
        dt_ms = int((time.time() - t0) * 1000)

        skill_counter: Dict[str, int] = {}
        for a in analyses:
            for s in (a.candidate.skills or []):
                skill_counter[s] = skill_counter.get(s, 0) + 1
        top_skills = sorted(skill_counter.items(), key=lambda x: x[1], reverse=True)[:5]
        insights = {
            "observed_trends": [f"{k} présent chez {v} candidats" for k, v in top_skills],
            "general_recommendations": [
                "Privilégier les candidats avec meilleur match compétences.",
                "Valider les compétences non visibles au CV lors de l’entretien.",
            ],
        }

        print(f"\n=== [/api/extract/launch] END n={n} avg={avg} time_ms={dt_ms} "
              f"processed={len(processed)} skipped={len(skipped)} ===")

        # 10) Payload
        return Response({
            "job": {
                "id": str(job.id),
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "experience_required": job.experience_required,
                "required_skills": job.required_skills,
            },
            "stats": {
                "candidates_analyzed": n,
                "average_score": avg,
                "top10_generated": min(10, n),
                "analysis_time_ms": dt_ms,
            },
            "top_candidates": [{
                "rank": i + 1,
                "candidate_id": str(a.candidate.id),
                "full_name": (f"{a.candidate.first_name} {a.candidate.last_name}".strip()
                              or a.candidate.email),
                "email": a.candidate.email,
                "main_skills": (a.candidate.skills or [])[:6],
                "score": a.overall_score,
                "label": ("Recommandé" if a.overall_score >= 8.5
                          else ("À considérer" if a.overall_score >= 7.5 else "Moyen")),
                "analysis_id": str(a.id),
            } for i, a in enumerate(top10)],
            "processed": processed,
            "skipped": skipped,
            "insights": insights,
        }, status=201)
