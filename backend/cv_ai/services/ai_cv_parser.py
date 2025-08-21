from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

HF_MODEL = "google/flan-t5-large"   # ou flan-ul2 pour plus de contexte
HF_DEVICE = 0 if torch.cuda.is_available() else -1

_PIPE = None
_TOK = None

def _get_pipe():
    global _PIPE, _TOK
    if _PIPE is None:
        print(f"[ai_cv_parser] loading model: {HF_MODEL} (device={HF_DEVICE})")
        _PIPE = pipeline(
            "text2text-generation",
            model=HF_MODEL,
            tokenizer=HF_MODEL,
            device=HF_DEVICE
        )
        _TOK = AutoTokenizer.from_pretrained(HF_MODEL, use_fast=True)
    return _PIPE, _TOK


def parse_cv_text(text: str) -> dict:
    """
    Analyse un CV (texte brut extrait du PDF) et retourne un JSON structuré.
    """
    pipe, tok = _get_pipe()

    prompt = f"""
    Voici le texte d’un CV. Analyse-le et retourne les informations sous format JSON clair
    avec les clés suivantes : "summary", "experiences", "education", "skills".

    CV:
    {text}
    """

    result = pipe(prompt, max_length=1024, do_sample=False)[0]["generated_text"]

    # Essaye de parser en JSON (si le modèle a bien respecté le format)
    import json
    try:
        parsed = json.loads(result)
    except:
        parsed = {"raw_output": result}

    return parsed
