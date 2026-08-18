import json
from pathlib import Path


INPUT_FILE = Path("data/rag/processed/chola_his_test.json")
OUTPUT_FILE = Path("data/rag/processed/chola_chunks.json")

CHUNK_SIZE = 100
OVERLAP = 20


def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    words = text.split()

    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])

        if chunk.strip():
            chunks.append(chunk)

        if end >= len(words):
            break

        start = end - overlap

    return chunks


def main():

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    pages = data["pages"]

    all_chunks = []
    chunk_id = 0

    for page_data in pages:

        page_number = page_data["page"]
        text = page_data["text"]

        chunks = chunk_text(text)

        for chunk in chunks:

            all_chunks.append({
                "chunk_id": chunk_id,
                "text": chunk,
                "source": data["source"],
                "page": page_number
            })

            chunk_id += 1

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            all_chunks,
            f,
            ensure_ascii=False,
            indent=2
        )

    print(f"Created {len(all_chunks)} chunks.")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()