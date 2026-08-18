from pathlib import Path
import json

from sentence_transformers import SentenceTransformer


INPUT_FILE = Path("data/rag/processed/chola_chunks.json")
OUTPUT_FILE = Path("data/rag/processed/chola_embeddings.npy")

MODEL_NAME = "intfloat/multilingual-e5-small"


def main():

    print("Loading embedding model...")

    model = SentenceTransformer(MODEL_NAME)

    with open(INPUT_FILE, "r", encoding="utf-8") as file:
        chunks = json.load(file)

    texts = [chunk["text"] for chunk in chunks]

    print(f"Embedding {len(texts)} chunks...")

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    import numpy as np

    np.save(OUTPUT_FILE, embeddings)

    print(f"Saved embeddings to: {OUTPUT_FILE}")
    print(f"Embedding shape: {embeddings.shape}")


if __name__ == "__main__":
    main()