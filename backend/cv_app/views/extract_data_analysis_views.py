import os
import uuid
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PyPDF2 import PdfReader  # pour lire le texte du PDF
from cv_ai.services.ai_cv_parser import parse_cv_text

TEMP_SUBDIR = "cv_analyzer_uploads"  # sous-dossier dans le répertoire temp du système


def _save_to_temp(uploaded_file) -> str:
    """
    Sauvegarde l'UploadedFile dans un dossier temporaire dédié et renvoie le chemin complet.
    """
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


def _extract_pdf_text(pdf_path: str) -> str:
    """
    Extraction du texte brut depuis un PDF.
    """
    text_content = []
    with open(pdf_path, "rb") as f:
        reader = PdfReader(f)
        for page in reader.pages:
            try:
                text_content.append(page.extract_text() or "")
            except Exception:
                continue
    return "\n".join(text_content)


@csrf_exempt
def parse_uploaded_cv(request, *, delete_after=True):
    """
    Upload d’un CV -> extraction du texte -> parsing IA -> JSON
    - Envoi attendu: form-data avec la clé 'file'
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST uniquement"}, status=405)

    uploaded = request.FILES.get("file")
    if not uploaded:
        return JsonResponse(
            {"error": "Veuillez envoyer un fichier via la clé 'file' (multipart/form-data)."},
            status=400,
        )

    # Sauvegarde temporaire
    tmp_path = _save_to_temp(uploaded)

    try:
        # Extraire texte du PDF
        cv_text = _extract_pdf_text(tmp_path)

        # Parsing IA
        data = parse_cv_text(cv_text)

        return JsonResponse(
            {
                "tmp_path": tmp_path,  # pour debug
                "parsed": data,
            },
            safe=False,
            status=200,
        )
    finally:
        if delete_after:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
