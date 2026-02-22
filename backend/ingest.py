import os
import chromadb
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="docs",
    metadata={"hnsw:space": "cosine"}
)

model = SentenceTransformer('all-MiniLM-L6-v2')


def ingest_docs():
    docs_dir = "../docs"

    for filename in os.listdir(docs_dir):
        if filename.endswith(".pdf"):
            print(f"Processing {filename}...")

            reader = PdfReader(os.path.join(docs_dir, filename))
            full_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    full_text += text

            chunks = []
            size = 500
            overlap = 50
            for i in range(0, len(full_text), size - overlap):
                chunks.append(full_text[i:i + size])

            embeddings = model.encode(chunks).tolist()
            ids = [f"{filename}_{i}" for i in range(len(chunks))]
            metadata = [{"source": filename}] * len(chunks)

            collection.add(
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadata,
                ids=ids
            )


if __name__ == "__main__":
    ingest_docs()
    print("Success! All documents are indexed in chroma_db.")