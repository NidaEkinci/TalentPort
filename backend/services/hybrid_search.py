"""Hibrit arama: Qdrant dense semantic + TF-IDF rerank.

JobScoutAI/deneme/app_hybrit.py içindeki hibrit_ara() algoritmasının
backend'e uyarlanmış halidir. Ağırlıklar runtime'da ayarlanabilir.
"""
from typing import List, Dict

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from database import client, COLLECTION
from services.embeddings import encode


def _normalize(arr: np.ndarray) -> np.ndarray:
    mn, mx = arr.min(), arr.max()
    if mx - mn == 0:
        return np.zeros_like(arr)
    return (arr - mn) / (mx - mn)


def hybrid_search(
    cv_text: str,
    max_results: int = 10,
    semantic_pool: int = 50,
    semantic_weight: float = 0.6,
    tfidf_weight: float = 0.4,
) -> List[Dict]:
    """CV metnini alır, Qdrant'tan semantik en yakın `semantic_pool` ilanı çeker
    ve TF-IDF ile yeniden sıralayarak birleşik skorla en iyi `max_results`
    ilanı döndürür."""
    query_vector = encode(cv_text)

    semantic_hits = client.query_points(
        collection_name=COLLECTION,
        query=query_vector,
        limit=semantic_pool,
        with_payload=True,
    ).points

    if not semantic_hits:
        return []

    ilan_metinleri = [
        f"{h.payload.get('title', '')} {h.payload.get('description', '')}"
        for h in semantic_hits
    ]
    tum_metinler = [cv_text] + ilan_metinleri

    vectorizer = TfidfVectorizer(
        sublinear_tf=True,
        min_df=1,
        ngram_range=(1, 2),
    )
    tfidf_matrix = vectorizer.fit_transform(tum_metinler)
    tfidf_scores = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1:]).flatten()

    semantic_scores = np.array([h.score for h in semantic_hits])
    semantic_norm = _normalize(semantic_scores)
    tfidf_norm = _normalize(tfidf_scores)

    combined = semantic_weight * semantic_norm + tfidf_weight * tfidf_norm

    sorted_idx = np.argsort(combined)[::-1][:max_results]

    results: List[Dict] = []
    for i in sorted_idx:
        h = semantic_hits[i]
        p = h.payload or {}
        results.append(
            {
                "id": str(p.get("job_id", h.id)),
                "title": p.get("title", ""),
                "company": p.get("company", p.get("company_name", "")),
                "location": p.get("location", ""),
                "description": p.get("description", ""),
                "semantic_score": float(semantic_norm[i]),
                "tfidf_score": float(tfidf_norm[i]),
                "combined_score": float(combined[i]),
            }
        )
    return results
