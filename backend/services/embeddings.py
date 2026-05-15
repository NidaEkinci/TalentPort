"""GTE multilingual embedding modeli — singleton lazy loader.

Model ilk encode() çağrısında belleğe yüklenir, sonraki çağrılarda cache'lenmiş
instance kullanılır. lru_cache thread-safe'tir.
"""
import os
from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer


DEFAULT_MODEL = "Alibaba-NLP/gte-multilingual-base"


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    name = os.getenv("GTE_MODEL_NAME", DEFAULT_MODEL)
    # GTE_DEVICE=cpu|cuda|mps (varsayilan cpu, çünkü MPS'de bilinen index hatası var)
    device = os.getenv("GTE_DEVICE", "cpu")
    return SentenceTransformer(name, trust_remote_code=True, device=device)


def encode(text: str) -> List[float]:
    """Metni normalize edilmiş embedding vektörüne dönüştürür."""
    model = get_model()
    return model.encode(text, normalize_embeddings=True).tolist()
