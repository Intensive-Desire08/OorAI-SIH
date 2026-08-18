from pathlib import Path
import json

from pypdf import PdfReader


DOCUMENT_DIR = Path("data/rag/documents")
OUTPUT_DIR = Path("data/rag/processed")


def extract_pdf(pdf_path):
    reader = PdfReader(pdf_path)

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text:
            pages.append({
                "page": page_number,
                "text": text.strip()
            })

    return pages


def process_pdf(pdf_path):
    pages = extract_pdf(pdf_path)

    document = {
        "source": pdf_path.name,
        "pages": pages
    }

    output_path = OUTPUT_DIR / f"{pdf_path.stem}.json"

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(
            document,
            file,
            ensure_ascii=False,
            indent=2
        )

    print(f"Saved: {output_path}")


if __name__ == "__main__":

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for pdf_path in DOCUMENT_DIR.glob("*.pdf"):
        print(f"\nProcessing: {pdf_path.name}")
        process_pdf(pdf_path)