import json
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


INDEX_FILE = Path("data/rag/processed/chola.index")
CHUNKS_FILE = Path("data/rag/processed/chola_chunks.json")
TEST_FILE = Path("data/rag/evaluation/retrieval_test.json")

MODEL_NAME = "intfloat/multilingual-e5-small"

TOP_K = 5


def load_data():
    index = faiss.read_index(str(INDEX_FILE))

    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    with open(TEST_FILE, "r", encoding="utf-8") as f:
        tests = json.load(f)

    return index, chunks, tests


def evaluate():
    print("Loading FAISS index...")
    index, chunks, tests = load_data()

    print(f"FAISS vectors: {index.ntotal}")
    print(f"Evaluation questions: {len(tests)}")

    print("\nLoading embedding model...")
    model = SentenceTransformer(MODEL_NAME)

    recall_1 = []
    recall_3 = []
    recall_5 = []
    reciprocal_ranks = []

    print("\nRunning evaluation...\n")

    for number, test in enumerate(tests, start=1):

        query = test["query"]
        relevant_chunks = set(test["relevant_chunks"])

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
            TOP_K
        )

        retrieved_chunks = [
            chunks[idx]["chunk_id"]
            for idx in ids[0]
            if idx != -1
        ]

        # Recall@1
        hit_1 = any(
            chunk_id in relevant_chunks
            for chunk_id in retrieved_chunks[:1]
        )

        # Recall@3
        hit_3 = any(
            chunk_id in relevant_chunks
            for chunk_id in retrieved_chunks[:3]
        )

        # Recall@5
        hit_5 = any(
            chunk_id in relevant_chunks
            for chunk_id in retrieved_chunks[:5]
        )

        recall_1.append(int(hit_1))
        recall_3.append(int(hit_3))
        recall_5.append(int(hit_5))

        # MRR
        reciprocal_rank = 0.0

        for rank, chunk_id in enumerate(retrieved_chunks, start=1):
            if chunk_id in relevant_chunks:
                reciprocal_rank = 1 / rank
                break

        reciprocal_ranks.append(reciprocal_rank)

        print(f"{number:02d}. {query}")
        print(f"    Relevant chunks : {sorted(relevant_chunks)}")
        print(f"    Retrieved chunks: {retrieved_chunks}")
        print(f"    MRR contribution: {reciprocal_rank:.3f}")
        print()

    print("=" * 60)
    print("RAG RETRIEVAL EVALUATION")
    print("=" * 60)

    print(f"Recall@1 : {np.mean(recall_1):.3f}")
    print(f"Recall@3 : {np.mean(recall_3):.3f}")
    print(f"Recall@5 : {np.mean(recall_5):.3f}")
    print(f"MRR      : {np.mean(reciprocal_ranks):.3f}")


if __name__ == "__main__":
    evaluate()