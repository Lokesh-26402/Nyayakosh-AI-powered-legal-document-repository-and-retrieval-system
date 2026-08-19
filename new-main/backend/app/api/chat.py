import json
import io
import re
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import ollama
from pypdf import PdfReader
from docx import Document
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

router = APIRouter()
chroma_client = chromadb.Client(Settings(anonymized_telemetry=False))

# This tiny model loads automatically in Python and creates vectors instantly!
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_text(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()
    try:
        if filename_lower.endswith('.pdf'):
            reader = PdfReader(io.BytesIO(file_bytes))
            return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        elif filename_lower.endswith(('.doc', '.docx')):
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join([p.text for p in doc.paragraphs])
        else:
            return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return ""

def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    text = re.sub(r'\s+', ' ', text).strip()
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= chunk_size:
            current_chunk += " " + sentence
        else:
            if current_chunk: chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk: chunks.append(current_chunk.strip())
    return chunks

@router.post("/api/chat/stream")
async def stream_chat_response(
    prompt: str = Form(""),
    persona: str = Form("defense_system"),
    history: str = Form("[]"),
    file: Optional[UploadFile] = File(None)
):
    try:
        messages_payload = [{
            "role": "system", 
            "content": "You are NYAYAKOSH, an automated RAG analysis engine. Answer precisely using the extracted context text provided."
        }]

        try:
            parsed_history = json.loads(history)
            for msg in parsed_history:
                if msg.get("content") and "REPOSITORY ANALYSIS" not in msg.get("content"):
                    messages_payload.append({
                        "role": "user" if msg.get("role") == "user" else "assistant",
                        "content": msg.get("content")
                    })
        except Exception:
            pass

        context_text = ""
        if file:
            file_bytes = await file.read()
            raw_text = extract_text(file_bytes, file.filename)
            
            if raw_text.strip():
                text_chunks = chunk_text(raw_text)
                
                # PYTHON HANDLES MATH INSTANTLY (No Ollama server configuration required)
                embeddings = embedding_model.encode(text_chunks).tolist()
                
                try: chroma_client.delete_collection("temp_doc")
                except Exception: pass
                
                collection = chroma_client.create_collection("temp_doc")
                collection.add(
                    embeddings=embeddings,
                    documents=text_chunks,
                    ids=[f"id_{i}" for i in range(len(text_chunks))]
                )
                
                search_query = prompt if prompt.strip() else "Provide an executive summary statement."
                query_vector = embedding_model.encode([search_query]).tolist()[0]
                
                results = collection.query(query_embeddings=[query_vector], n_results=2)
                if results and results['documents']:
                    context_text = "\n\n".join(results['documents'][0])

        if context_text:
            final_user_prompt = (
                f"[TRUE VECTOR RAG CONTEXT EXTRACTS]:\n{context_text}\n\n"
                f"USER QUESTION: {prompt if prompt.strip() else 'Provide a brief summary breakdown.'}"
            )
        else:
            final_user_prompt = prompt

        messages_payload.append({"role": "user", "content": final_user_prompt})

        async def response_generator():
            try:
                response_stream = ollama.chat(
                    model="llama3", 
                    messages=messages_payload, 
                    stream=True,
                    options={"num_predict": 200, "temperature": 0.2}
                )
                for chunk in response_stream:
                    token = chunk.get("message", {}).get("content", "")
                    if token:
                        yield f"{json.dumps({'message': {'content': token}})}\n"
            except Exception as inner_err:
                yield f"{json.dumps({'message': {'content': f'❌ **LOCAL CORE ERROR:** {str(inner_err)}'}})}\n"

        return StreamingResponse(response_generator(), media_type="application/x-ndjson")

    except Exception as e:
        error_line = {"message": {"content": f"❌ **BACKEND ERROR:** {str(e)}"}}
        return StreamingResponse(io.StringIO(f"{json.dumps(error_line)}\n"), media_type="application/x-ndjson")