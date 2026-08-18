from pathlib import Path
import json

import faiss
import numpy as np


EMBEDDINGS_FILE = Path(
    "data/rag/processed/chola_embeddings.npy"
)

CHUNKS_FILE = Path(
    "data/rag/processed/chola_chunks.json"
)

INDEX_FILE = Path(
    "data/rag/processed/chola.index"
)


def main():

    # Load embeddings
    embeddings = np.load(EMBEDDINGS_FILE)

    # FAISS expects float32
    embeddings = embeddings.astype("float32")

    print("Embeddings shape:", embeddings.shape)

    # Number of dimensions in each vector
    dimension = embeddings.shape[1]

    # Inner Product index
    index = faiss.IndexFlatIP(dimension)

    # Add vectors to FAISS
    index.add(embeddings)

    print("Vectors added:", index.ntotal)

    # Save index
    faiss.write_index(index, str(INDEX_FILE))

    print(f"Saved FAISS index to: {INDEX_FILE}")


if __name__ == "__main__":
    main()