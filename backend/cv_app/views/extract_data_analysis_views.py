import os
import re  
import uuid
import tempfile
from typing import List, Tuple, Dict, Any
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from cv_ai.services.ai_cv_parser import parse_cv
from cv_ai.services.ai_structure import structure_batch_from_extraction
from cv_ai.services.ai_matcher import analyze_candidates_from_parse_results  

TEMP_SUBDIR = "cv_analyzer_uploads"

def _save_to_temp(uploaded_file) -> str:
    base_tmp = tempfile.gettempdir()
    tmp_dir = os.path.join(base_tmp, TEMP_SUBDIR)
    os.makedirs(tmp_dir, exist_ok=True)
    ext = os.path.splitext(getattr(uploaded_file, "name", ""))[1] or ".pdf"
    fname = f"{uuid.uuid4().hex}{ext}"
    tmp_path = os.path.join(tmp_dir, fname)
    with open(tmp_path, "wb") as out:
        for chunk in uploaded_file.chunks():
            out.write(chunk)
    return tmp_path

def _collect_files(request) -> List[Tuple[str, Any]]:
    files: List[Tuple[str, Any]] = []
    for f in request.FILES.getlist("file"):
        files.append((getattr(f, "name", "unknown.pdf"), f))
    for f in request.FILES.getlist("files"):
        files.append((getattr(f, "name", "unknown.pdf"), f))
    return files

def _split_skills(s: str) -> List[str]:  # <-- NEW
    if not s:
        return []
    raw = [p.strip() for p in re.split(r"[,\n;]+", s) if p.strip()]
    out, seen = [], set()
    for x in raw:
        t = x.lower()
        if t not in seen:
            seen.add(t); out.append(t)
    return out

@csrf_exempt
def parse_uploaded_cv(request, *, delete_after=True):
    """
    Supporte 1 ou plusieurs CV.
    Flags:
      - structure=1 -> ajoute 'structured' par CV
      - analyze=1   -> génère 'analysis' (Top-K) en utilisant la fiche de poste postée
    Champs fiche de poste attendus (POST):
      - title, company, location, experience_required, description, required_skills
      (+ alias: job_location/location, experience, job_description/description, skills/required_skills)
      - top_k, llm_insights, llm_on_top_n (optionnels)
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST uniquement"}, status=405)

    files = _collect_files(request)
    if not files:
        uploaded = request.FILES.get("file")
        if not uploaded:
            return JsonResponse({"error": "Envoyez un ou plusieurs fichiers via 'file' (multiple) ou 'files'."}, status=400)
        files = [(getattr(uploaded, "name", "unknown.pdf"), uploaded)]

    job_title = request.POST.get("title", "") or ""
    raw_req_skills = request.POST.get("required_skills", "") or ""
    required_skills = [s.strip() for s in raw_req_skills.split(",") if s.strip()]

    # Flags
    want_structure = (request.GET.get("structure") == "1") or (request.POST.get("structure") == "1")
    want_analyze   = (request.GET.get("analyze") == "1") or (request.POST.get("analyze") == "1")
    if want_analyze:  # l’analyse nécessite la structuration
        want_structure = True

    results = []
    for original_name, uploaded in files:
        tmp_path = _save_to_temp(uploaded)
        try:
            parsed = parse_cv(tmp_path, job_title=job_title, required_skills=required_skills)
            results.append({
                "original_name": original_name,
                "tmp_path": tmp_path,
                "parsed": parsed,
                "status": "ok",
            })
        except Exception as e:
            results.append({
                "original_name": original_name,
                "tmp_path": tmp_path,
                "parsed": None,
                "status": "error",
                "error": str(e),
            })
        finally:
            if delete_after:
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

    # --- Réponses ---
    # compat: 1 seul fichier -> format simple
    if len(results) == 1 and not want_analyze:
        r = results[0]
        if r["status"] != "ok":
            return JsonResponse({"error": r.get("error", "Erreur inconnue"), "tmp_path": r["tmp_path"]}, status=500)

        payload = {"tmp_path": r["tmp_path"], "parsed": r["parsed"]}

        if want_structure:
            try:
                structured_batch = structure_batch_from_extraction({"count": 1, "results": [r]})
                if structured_batch.get("results"):
                    payload["structured"] = structured_batch["results"][0].get("structured", {})
            except Exception as e:
                payload["structured_error"] = str(e)

        return JsonResponse(payload, status=200)

    # multi-fichiers (ou analyse demandée)
    response = {"count": len(results), "results": results}

    if want_structure:
        try:
            structured_batch = structure_batch_from_extraction(response)
            for i, s in enumerate(structured_batch.get("results", [])):
                try:
                    results[i]["structured"] = s.get("structured", {})
                    if s.get("status") == "error":
                        results[i]["structured_status"] = "error"
                        results[i]["structured_error"] = s.get("error", "")
                except Exception:
                    pass
        except Exception as e:
            response["structured_error"] = str(e)

    # --- ANALYSE & TOP-K (facultatif) ---
    if want_analyze:
        # on tolère plusieurs noms de champs côté front
        job_profile = {
            "title": request.POST.get("title", "") or "",
            "company": request.POST.get("company", "") or "",
            "location": request.POST.get("job_location", "") or request.POST.get("location", "") or "",
            "experience_required": request.POST.get("experience_required", "") or request.POST.get("experience", "") or "",
            "description": request.POST.get("job_description", "") or request.POST.get("description", "") or "",
            "required_skills": _split_skills(
                request.POST.get("required_skills", "") or request.POST.get("skills", "")
            ),
        }
        try:
            analysis = analyze_candidates_from_parse_results(
                job_profile,
                {"results": results},
                top_k=int(request.POST.get("top_k", 10) or 10),
                use_llm_insights=(request.POST.get("llm_insights", "1") != "0"),
                llm_on_top_n=int(request.POST.get("llm_on_top_n", 10) or 10),
            )
            response["analysis"] = analysis
        except Exception as e:
            response["analysis_error"] = str(e)

    return JsonResponse(response, status=200)
