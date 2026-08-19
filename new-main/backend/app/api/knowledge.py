import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.utils.rag_engine import extract_and_index_file

router = APIRouter(prefix="/api/documents", tags=["RAG Ingestion Engine"])
UPLOAD_DIR = os.path.join(os.getcwd(), "local_storage")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def ingest_legal_document(file: UploadFile = File(...)):
    filename_lower = file.filename.lower()
    
    # Expanded validation sequence bounds tracking parameters natively
    if not filename_lower.endswith(('.txt', '.html', '.csv', '.pdf', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Unsupported classification profile template.")
        
    destination_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        total_chunks = extract_and_index_file(destination_path, file.filename)
        return {
            "status": "Success",
            "filename": file.filename,
            "processed_chunks": total_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline storage error: {str(e)}")