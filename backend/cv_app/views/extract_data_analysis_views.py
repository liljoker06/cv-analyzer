import os
import uuid
import tempfile
from typing import List, Tuple, Dict, Any
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from cv_ai.services.ai_cv_parser import parse_cv 
from cv_ai.services.ai_structure import structure_batch_from_extraction


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
    """
    Récupère tous les fichiers envoyés :
    - 'file' répété (input multiple)
    - ou 'files'
    Retourne une liste de tuples (original_name, uploaded_file)
    """
    files: List[Tuple[str, Any]] = []
    # plusieurs 'file'
    for f in request.FILES.getlist("file"):
        files.append((getattr(f, "name", "unknown.pdf"), f))
    # plusieurs 'files'
    for f in request.FILES.getlist("files"):
        files.append((getattr(f, "name", "unknown.pdf"), f))
    return files

@csrf_exempt
def parse_uploaded_cv(request, *, delete_after=True):
    """
    Supporte 1 ou plusieurs CV dans la même requête.
    - Si un seul fichier est envoyé, conserve un format de réponse simple (compat).
    - Si plusieurs fichiers sont envoyés, renvoie 'results': [ ... ].
    Champs optionnels:
      - title
      - required_skills (CSV)
      - structure=1  -> ajoute un champ 'structured' par CV (appel HF)
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

    # Flag: activer la structuration IA ?
    want_structure = (request.GET.get("structure") == "1") or (request.POST.get("structure") == "1")

    results = []
    for original_name, uploaded in files:
        tmp_path = _save_to_temp(uploaded)
        try:
            parsed = parse_cv(tmp_path, job_title=job_title, required_skills=required_skills)
            results.append({
                "original_name": original_name,
                "tmp_path": tmp_path,     # informatif; peut être supprimé plus bas si delete_after=True
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
    if len(results) == 1:
        # Compat: format "simple"
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
                # On ne casse pas la réponse si la structuration échoue
                payload["structured_error"] = str(e)

        return JsonResponse(payload, status=200)

    # Cas multi-fichiers
    response = {"count": len(results), "results": results}

    if want_structure:
        try:
            structured_batch = structure_batch_from_extraction(response)
            # merge 'structured' par index (mêmes ordres)
            for i, s in enumerate(structured_batch.get("results", [])):
                try:
                    results[i]["structured"] = s.get("structured", {})
                    # en cas d'erreur par item, on peut propager l'erreur sans casser le lot
                    if s.get("status") == "error":
                        results[i]["structured_status"] = "error"
                        results[i]["structured_error"] = s.get("error", "")
                except Exception:
                    pass
        except Exception as e:
            # Si l'appel HF complet échoue, on ajoute juste un champ global d'erreur
            response["structured_error"] = str(e)

    return JsonResponse({"count": len(results), "results": results}, status=200)
