from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app.api.knowledge import router as doc_router

app = FastAPI(
    title="NyayaKosh API",
    description="Backend for Local/Offline LLM Legal advisory dashboard",
    version="2.0"
)

# Enable clean cross-origin connection sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(doc_router)

@app.get("/")
async def root():
    return {"status": "NyayaKosh Backend API Active", "mode": "Offline"}