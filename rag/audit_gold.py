import json
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


INDEX_FILE = Path("data/rag/processed/chola.index")
CHUNKS_FILE = Path("data/rag/processed/chola_chunks.json")
TEST_FILE = Path("data/rag/evaluation/retrieval_test.json")

OUTPUT_FILE = Path("data/rag/evaluation/gold_audit.json")

MODEL_NAME = "intfloat/multilingual-e5-small"

CANDIDATES = 10


def load_data():
    index = faiss.read_index(str(INDEX_FILE))

    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    with open(TEST_FILE, "r", encoding="utf-8") as f:
        tests = json.load(f)

    return index, chunks, tests


def main():

    print("Loading FAISS index...")
    index, chunks, tests = load_data()

    print(f"FAISS vectors : {index.ntotal}")
    print(f"Questions     : {len(tests)}")

    print("\nLoading embedding model...")
    model = SentenceTransformer(MODEL_NAME)

    audit = []

    print("\nRunning candidate search...\n")

    for number, test in enumerate(tests, start=1):

        query = test["query"]

        embedding = model.encode(
            [query],
            normalize_embeddings=True
        )

        embedding = np.asarray(
            embedding,
            dtype="float32"
        )

        scores, ids = index.search(
            embedding,
            CANDIDATES
        )

        candidates = []

        for rank, (score, idx) in enumerate(
            zip(scores[0], ids[0]),
            start=1
        ):

            if idx == -1:
                continue

            chunk = chunks[idx]

            candidates.append({
                "rank": rank,
                "chunk_id": chunk["chunk_id"],
                "score": float(score),
                "page": chunk["page"],
                "text": chunk["text"]
            })

        audit.append({
            "question_id": number,
            "query": query,
            "current_gold": test.get("relevant_chunks", []),
            "candidates": candidates
        })

        print(
            f"{number:02d}. "
            f"{query} "
            f"→ {[c['chunk_id'] for c in candidates]}"
        )

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            audit,
            f,
            ensure_ascii=False,
            indent=2
        )

    print("\n" + "=" * 60)
    print("GOLD AUDIT CREATED")
    print("=" * 60)
    print(f"Saved to: {OUTPUT_FILE}")
    print()
    print("The file contains:")
    print("  • every evaluation question")
    print("  • top candidate chunks")
    print("  • similarity scores")
    print("  • chunk text")
    print("  • current gold labels")
    print()
    print("Now inspect gold_audit.json and correct")
    print("relevant_chunks in retrieval_test.json.")


if __name__ == "__main__":
    main()