import json
import sys
from pathlib import Path


CHUNKS_FILE = Path("data/rag/processed/chola_chunks.json")


def main():

    if len(sys.argv) < 2:
        print('Usage: python .\\rag\\inspect_chunks.py "keyword"')
        return

    keyword = " ".join(sys.argv[1:]).lower()

    with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    found = 0

    for chunk in chunks:

        if keyword in chunk["text"].lower():

            print("\n" + "=" * 70)
            print(f"CHUNK ID : {chunk['chunk_id']}")
            print(f"SOURCE   : {chunk['source']}")
            print(f"PAGE     : {chunk['page']}")
            print("-" * 70)
            print(chunk["text"])

            found += 1

    print("\n" + "=" * 70)
    print(f"Found {found} matching chunks.")


if __name__ == "__main__":
    main()