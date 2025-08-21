from __future__ import annotations

import os
from typing import Union, IO, List
from .pdf_extract import extract_text, normalize_whitespace  # <-- on utilise le nouveau module

# =========================
#     PUBLIC API (brut)
# =========================
def parse_cv(
    source: Union[str, os.PathLike, IO[bytes]],
    job_title: str = "",                        # ignoré (compat)
    required_skills: List[str] | None = None,   # ignoré (compat)
) -> dict:
    """
    Extraction brute uniquement.
    Retourne un JSON minimal: {"raw_text": "...", "chars": N}
    Conserve la même signature que précédemment pour éviter de casser l'API.
    """
    text = extract_text(source)

    # normalisation légère (pas de regex)
    text_norm = normalize_whitespace(text)

    # log court pour éviter le spam
    print("Texte brut extrait du PDF ===>")
    print(text_norm[:2000])  # affiche les 2000 premiers caractères

    return {"raw_text": text_norm, "chars": len(text_norm)}