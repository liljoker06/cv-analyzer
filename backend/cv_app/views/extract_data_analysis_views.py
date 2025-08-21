# cv_app/views/extract_data_analysis_views.py
# -----------------------------------------------------------
# Upload de CVs + extraction minimale + création du Job +
# upsert des candidats + calcul de scores placeholder +
# retour JSON pour l'écran Top 10 / Stats / Insights.
# -----------------------------------------------------------

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

# ---- Dépendances extraction (facultatives : on gère l'absence proprement)
try:
    import PyPDF2  # type: ignore
except Exception:  # pragma: no cover
    PyPDF2 = None

try:
    import docx  # python-docx  # type: ignore
except Exception:  # pragma: no cover
    docx = None


# ---- Paramètres d'upload
ALLOWED_CT = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


# ---------------------- Utils extraction ----------------------
def _extract_text_from_pdf(file_obj) -> str:
    """Extrait un texte brut depuis un PDF."""
    if not PyPDF2:
        return ""
    try:
        reader = PyPDF2.PdfReader(file_obj)
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    except Exception:
        return ""


def _extract_text_from_docx(file_obj) -> str:
    """Extrait un texte brut depuis un DOCX."""
    if not docx:
        return ""
    try:
        d = docx.Document(file_obj)
        return "\n".join(p.text for p in d.paragraphs)
    except Exception:
        return ""


def _extract_text(uploaded) -> str:
    """Tente d'extraire un texte selon l'extension / content-type."""
    name = getattr(uploaded, "name", "").lower()
    ctype = getattr(uploaded, "content_type", "").lower()
    if "pdf" in name or ctype == "application/pdf":
        return _extract_text_from_pdf(uploaded)
    if name.endswith(".docx") or ctype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _extract_text_from_docx(uploaded)
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
    """Nettoie une chaîne de compétences en liste normalisée en minuscules."""
    if not raw:
        return []
    parts = re.split(r"[,\n;]", raw)
    return [p.strip().lower() for p in parts if p.strip()]


def _parse_skills_from_text(text: str) -> List[str]:
    """Détection très simple de quelques compétences dans le CV (placeholder)."""
    seeds = [
        "python", "django", "fastapi", "flask", "pandas", "numpy", "scikit-learn",
        "machine learning", "ml", "deep learning", "nlp", "sql", "nosql", "mongodb",
        "react", "next.js", "typescript", "javascript", "docker", "kubernetes",
        "aws", "gcp", "azure", "git", "linux", "rest", "microservices"
    ]
    low = text.lower()
    return sorted({k for k in seeds if k in low})


def _compute_scores(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, float]:
    """
    Calcule des scores de manière simplifiée (placeholder avant la vraie IA).
    - skills_score: % de match des compétences requises, ramené sur 10
    - autres scores: 5.0 par défaut
    - overall_score: moyenne pondérée simple
    """
    req = [s.strip().lower() for s in required_skills if s.strip()]
    cand = [s.strip().lower() for s in candidate_skills]
    if not req:
        skills = 5.0  # neutre si rien n'est demandé
    else:
        overlap = len(set(req).intersection(set(cand)))
        pct = 10.0 * overlap / max(1, len(req))
        skills = round(pct, 1)

    # placeholders (à remplacer par l'IA plus tard)
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
    Reçoit le formulaire RH + plusieurs fichiers (PDF/DOCX),
    crée le Job, upsert les candidats, stocke les documents (GridFS via FileField),
    calcule des scores simplifiés et renvoie Top 10 + stats + insights.

    Form-data attendu (multipart/form-data) :
      - title (str) [requis]
      - company (str)
      - location (str)
      - experience_required (str)
      - description (str)
      - required_skills (str ; liste séparée par virgule/ligne)
      - files[] (un ou plusieurs fichiers PDF/DOCX)
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        t0 = time.time()

        # 1) Création de la fiche de poste
        title = request.POST.get("title")
        if not title:
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

        # 2) Récupération des fichiers
        files = request.FILES.getlist("files") or request.FILES.getlist("files[]")
        if not files:
            return Response({"error": "Aucun fichier fourni (paramètre files[])."}, status=400)

        processed = []
        skipped = []

        for f in files:
            try:
                # Contrôles simples
                if f.size and f.size > MAX_SIZE:
                    skipped.append({"filename": f.name, "reason": "file too large"})
                    continue
                if getattr(f, "content_type", None) not in ALLOWED_CT:
                    skipped.append({"filename": f.name, "reason": "unsupported content-type"})
                    continue

                # Extraction de texte
                text = _extract_text(f)
                try:
                    f.seek(0)  # important pour re-lire le flux lors du put() GridFS
                except Exception:
                    pass

                email = _guess_email(text)
                phone = _guess_phone(text)
                skills_from_text = _parse_skills_from_text(text)

                if not email:
                    skipped.append({"filename": f.name, "reason": "email not found in CV"})
                    continue

                # 3) Upsert Candidat depuis l'email
                cand = Candidate.objects(email=email).first()
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

                # 4) Stockage du document (GridFS via mongoengine FileField)
                doc = DocumentFile(candidate=cand, doc_type="cv")
                doc.file.put(
                    f,
                    filename=getattr(f, "name", "upload"),
                    content_type=getattr(f, "content_type", None),
                )
                doc.save()

                # 5) Calcul des scores placeholder
                scores = _compute_scores(cand.skills or [], job.required_skills)

                # 6) Upsert Analyse (unique par couple job+candidat)
                ana = Analysis.objects(job=job, candidate=cand).first()
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
                        strengths="Compétences détectées : " + ", ".join((cand.skills or [])[:10]),
                        weaknesses="À affiner via IA.",
                        recommendations="Vérifier adéquation soft skills.",
                        analyzed_at=datetime.now(timezone.utc),
                        status="pending",
                    ).save()
                else:
                    ana.overall_score = scores["overall_score"]
                    ana.skills_score = scores["skills_score"]
                    ana.experience_score = scores["experience_score"]
                    ana.education_score = scores["education_score"]
                    ana.communication_score = scores["communication_score"]
                    ana.culture_score = scores["culture_score"]
                    ana.analyzed_at = datetime.now(timezone.utc)
                    ana.save()

                processed.append({
                    "candidate_id": str(cand.id),
                    "document_id": str(doc.id),
                    "email": cand.email,
                    "score": ana.overall_score,
                })

            except Exception as e:  # pragma: no cover
                skipped.append({"filename": getattr(f, "name", "?"), "reason": str(e)})

        # 7) Statistiques + Top 10 + Insights
        analyses = Analysis.objects(job=job).order_by("-overall_score")
        top10 = analyses[:10]

        n = analyses.count()
        avg = round(sum(a.overall_score for a in analyses) / max(1, n), 1)
        dt_ms = int((time.time() - t0) * 1000)

        # Insights ultra-simples (fréquence des skills)
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

        # 8) Payload compatible avec l’écran du front
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
                "average_score": avg,           # /10
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
                "score": a.overall_score,       # /10
                "label": ("Recommandé" if a.overall_score >= 8.5
                          else ("À considérer" if a.overall_score >= 7.5 else "Moyen")),
                "analysis_id": str(a.id),
            } for i, a in enumerate(top10)],
            "processed": processed,
            "skipped": skipped,
            "insights": insights,
        }, status=201)
