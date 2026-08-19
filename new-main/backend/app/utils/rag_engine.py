import os
import json
import math
import httpx
from pypdf import PdfReader
from docx import Document

DB_FILE = os.path.join(os.getcwd(), "local_vector_db.json")

def get_ollama_embedding(text: str) -> list:
    try:
        response = httpx.post(
            "http://localhost:11434/api/embeddings",
            json={"model": "llama3", "prompt": text},
            timeout=30.0
        )
        if response.status_code == 200:
            return response.json().get("embedding", [])
    except Exception as e:
        print(f"Embedding calculation error: {e}")
    return []

def cosine_similarity(v1: list, v2: list) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def extract_and_index_file(file_path: str, filename: str):
    text = ""
    ext = filename.lower()
    
    try:
        if ext.endswith(('.txt', '.html', '.csv')):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        elif ext.endswith('.pdf'):
            reader = PdfReader(file_path)
            text_content = [page.extract_text() for page in reader.pages if page.extract_text()]
            text = "\n".join(text_content)
        elif ext.endswith(('.doc', '.docx')):
            doc = Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        else:
            text = ""
    except Exception as parse_err:
        print(f"Error parsing tracking sequence format details: {parse_err}")
        return 0

    if not text.strip():
        return 0

    words = text.split()
    chunks = []
    chunk_size = 120
    overlap = 30
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk_words = words[i:i + chunk_size]
        if len(chunk_words) > 10:
            chunks.append(" ".join(chunk_words))

    db_data = []
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                db_data = json.load(f)
        except:
            db_data = []

    for chunk in chunks:
        embedding = get_ollama_embedding(chunk)
        if embedding:
            db_data.append({
                "source": filename,
                "text": chunk,
                "embedding": embedding
            })

    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db_data, f, indent=2)

    return len(chunks)

def query_relevant_context(user_query: str, num_results: int = 2) -> str:
    if not os.path.exists(DB_FILE):
        return ""

    query_vector = get_ollama_embedding(user_query)
    if not query_vector:
        return ""

    with open(DB_FILE, "r", encoding="utf-8") as f:
        db_data = json.load(f)

    scored_chunks = []
    for item in db_data:
        similarity = cosine_similarity(query_vector, item["embedding"])
        scored_chunks.append((similarity, item["text"], item["source"]))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_matches = scored_chunks[:num_results]

    context_blocks = []
    for score, text, source in top_matches:
        if score > 0.35:
            context_blocks.append(f"[Source: {source}]\n{text}")

    return "\n\n---\n\n".join(context_blocks)