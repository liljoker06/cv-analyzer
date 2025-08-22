from __future__ import annotations

import os
from typing import Union, IO, List

# --- Extraction PDF ---
try:
    import pdfplumber
except Exception:
    pdfplumber = None

try:
    import PyPDF2  
except Exception:
    PyPDF2 = None


def _extract_text_pdf_from_path(path: str) -> str:
    """Extrait le texte d'un PDF depuis un chemin de fichier.
    Essaie d'abord pdfplumber, puis PyPDF2. Soulève une RuntimeError si aucun extracteur dispo.
    """
    if pdfplumber:
        try:
            txts: List[str] = []
            with pdfplumber.open(path) as pdf:
                for p in pdf.pages:
                    t = p.extract_text() or ""
                    if t.strip():
                        txts.append(t)
            combined = "\n".join(txts).strip()
            print(f"[pdf_extract] extracted via pdfplumber | chars={len(combined)}")
            if combined:
                return combined
        except Exception as e:
            print(f"[pdf_extract] pdfplumber failed: {e}")

    if PyPDF2:
        try:
            txts = []
            with open(path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    t = page.extract_text() or ""
                    if t.strip():
                        txts.append(t)
            combined = "\n".join(txts).strip()
            print(f"[pdf_extract] extracted via PyPDF2 | chars={len(combined)}")
            return combined
        except Exception as e:
            print(f"[pdf_extract] PyPDF2 failed: {e}")

    raise RuntimeError("Aucun extracteur PDF dispo. Installe pdfplumber ou PyPDF2.")


def extract_text(source: Union[str, os.PathLike, IO[bytes]]) -> str:
    """Extraction brute depuis un chemin ou un file-like (bytes)."""
    if hasattr(source, "read"):
        # file-like -> on écrit un tmp pour les extracteurs
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(source.read())
            tmp_path = tmp.name
        try:
            return _extract_text_pdf_from_path(tmp_path)
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
    else:
        return _extract_text_pdf_from_path(str(source))


def normalize_whitespace(s: str) -> str:
    """Normalisation douce: retire les espaces multiples et insécables, sans regex."""
    return " ".join((s or "").replace("\u00A0", " ").split())


__all__ = ["extract_text", "normalize_whitespace"]