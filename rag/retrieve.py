import sys
from pathlib import Path
import json

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


INDEX_FILE = Path("data/rag/processed/chola.index")
CHUNKS_FILE = Path("data/rag/processed/chola_chunks.json")

MODEL_NAME = "intfloat/multilingual-e5-small"


def retrieve(query, top_k=5):

    index = faiss.read_index(str(INDEX_FILE))

    with open(CHUNKS_FILE, "r", encoding="utf-8") as file:
        chunks = json.load(file)

    model = SentenceTransformer(MODEL_NAME)

    query_embedding = model.encode(
        [query],
        normalize_embeddings=True
    )

    query_embedding = np.asarray(
        query_embedding,
        dtype="float32"
    )

    scores, ids = index.search(
        query_embedding,
        top_k
    )

    results = []

    for score, idx in zip(scores[0], ids[0]):

        chunk = chunks[idx]

        results.append({
            "score": float(score),
            "text": chunk["text"],
            "source": chunk["source"],
            "page": chunk["page"]
        })

    return results


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage:")
        print('python .\\rag\\retrieve.py "your question"')
        sys.exit(1)

    query = " ".join(sys.argv[1:])

    print(f"\nQUESTION:\n{query}")

    results = retrieve(query)

    print("\nTOP RESULTS:")

    for rank, result in enumerate(results, start=1):

        print(f"\n--- Result {rank} ---")
        print(f"Score: {result['score']:.4f}")
        print(f"Source: {result['source']}")
        print(f"Page: {result['page']}")
        print(f"Text: {result['text']}")