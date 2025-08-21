from typing import Iterator, Tuple
from decouple import config
from transformers import pipeline

# Cache simple pour éviter de recharger
_PIPE_CACHE = {}

def _detect_mode(model_name: str) -> str:
    name = (model_name or "").lower()
    # T5/FLAN -> text2text ; sinon causal LM
    if "t5" in name or "flan" in name:
        return "t5"
    return "causal"

def get_generators() -> Iterator[Tuple[str, object, str]]:
    models = [m.strip() for m in config("HF_EXTRACTOR_MODELS", default="google/flan-t5-base").split(",") if m.strip()]
    for m in models:
        if m in _PIPE_CACHE:
            yield (m, _PIPE_CACHE[m]["pipe"], _PIPE_CACHE[m]["mode"]); continue
        mode = _detect_mode(m)
        if mode == "t5":
            pipe = pipeline("text2text-generation", model=m, device_map="auto")
        else:
            pipe = pipeline("text-generation", model=m, device_map="auto")
        _PIPE_CACHE[m] = {"pipe": pipe, "mode": mode}
        yield (m, pipe, mode)
