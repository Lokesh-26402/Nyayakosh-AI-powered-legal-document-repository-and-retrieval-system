# ⚖️ NyayaKosh – AI-Powered Legal Document Repository-and-retrieval-system

## 📌 About the Project

**NyayaKosh** is an AI-powered legal document repository and intelligent information retrieval system developed to simplify the process of storing, searching, and understanding large collections of legal documents.

Traditional document management systems mainly depend on keyword-based searches, which can make it difficult to find the exact information required from large or complex legal documents. NyayaKosh addresses this limitation by using **Artificial Intelligence, Natural Language Processing (NLP), Optical Character Recognition (OCR), Vector Embeddings, and Retrieval-Augmented Generation (RAG)** to provide intelligent and context-aware document search and question answering.

Users can upload legal documents such as PDFs and other supported document formats into the system. The application extracts the text from these documents and uses OCR when the documents are scanned or image-based. The extracted content is then processed, divided into meaningful chunks, converted into vector embeddings, and stored in a vector database for semantic retrieval.

When a user asks a question through the chat interface, NyayaKosh identifies the most relevant sections from the uploaded documents and provides them as context to a **Large Language Model (LLM)**. The LLM then generates a response based on the retrieved information. This Retrieval-Augmented Generation approach helps the system provide answers that are more closely related to the available legal documents rather than relying only on the model's general knowledge.

The project uses **React.js** for the frontend, **FastAPI with Python** for the backend, **ChromaDB** for vector storage, **SQLite** for metadata management, **Tesseract OCR** for scanned documents, and **Ollama** for local Large Language Model inference.

NyayaKosh is designed as a privacy-oriented solution because the LLM can run locally through Ollama. This allows legal documents to be processed locally without depending on external cloud-based LLM inference.

Overall, NyayaKosh provides an end-to-end platform for **legal document ingestion, OCR-based text extraction, semantic search, vector-based retrieval, and AI-powered question answering**.

---

## 🎯 Project Objective

The primary objective of NyayaKosh is to develop an intelligent legal knowledge repository that can:

- Store and organize legal documents.
- Extract text from different document formats.
- Process scanned documents using OCR.
- Convert document content into meaningful vector representations.
- Perform semantic search across uploaded documents.
- Retrieve relevant legal information based on user queries.
- Generate context-aware answers using a local LLM.
- Provide an easy-to-use chat-based interface for interacting with legal documents.

---

## 🚀 Key Features

- 📄 **Legal Document Upload** – Upload and manage legal documents.
- 🔍 **Semantic Search** – Find information based on the meaning of the query.
- 🤖 **AI Question Answering** – Ask questions about uploaded documents.
- 📑 **OCR Processing** – Extract text from scanned and image-based documents.
- 🧠 **RAG Pipeline** – Retrieve relevant document information before generating answers.
- 🔤 **Vector Embeddings** – Convert document content into searchable vector representations.
- 🗄️ **ChromaDB** – Store and retrieve document embeddings efficiently.
- 🦙 **Ollama Integration** – Run the Large Language Model locally.
- 💬 **Interactive Chat Interface** – Communicate with the system through a React-based interface.
- 💾 **SQLite Database** – Store document and workspace metadata.
- 📁 **Workspace Management** – Organize and manage uploaded documents.
- 📦 **ZIP Upload Support** – Upload multiple documents together.
- 🌙 **Modern UI** – Includes a user-friendly interface with dark mode and interactive components.

---

## 🧠 How the System Works

The overall workflow of NyayaKosh can be summarized as:

```text
Legal Document
      ↓
Document Upload
      ↓
Text Extraction / OCR
      ↓
Text Processing
      ↓
Document Chunking
      ↓
Vector Embedding Generation
      ↓
ChromaDB Vector Storage
      ↓
User Question
      ↓
Semantic Search
      ↓
Relevant Document Retrieval
      ↓
RAG Context
      ↓
Ollama / Local LLM


new/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   └── knowledge.py
│   │   │
│   │   ├── core/
│   │   │   └── config.py
│   │   │
│   │   ├── services/
│   │   │   ├── llm.py
│   │   │   └── rag.py
│   │   │
│   │   ├── utils/
│   │   │   └── rag_engine.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .gitignore
└── README.md
      ↓
Context-Aware AI Answer


# 🛠️ Technology Stack


NyayaKosh is built using modern **AI, NLP, RAG, web development, OCR, and database technologies**.


---


## 🎨 Frontend Technologies


- ⚛️ **React.js** – Interactive user interface
- ⚡ **Vite** – Fast frontend development and build tool
- 🎨 **Tailwind CSS** – Responsive and modern UI styling
- ✨ **Framer Motion** – UI animations and transitions
- 📝 **React Markdown** – Markdown rendering in the chat interface


---


## ⚙️ Backend Technologies


- 🐍 **Python** – Backend development and AI processing
- 🚀 **FastAPI** – REST API development
- ⚡ **Uvicorn** – ASGI server
- 🔐 **Pydantic** – Data validation
- 🌐 **HTTPX** – HTTP communication


---


# 🤖 AI & Machine Learning


### AI Models and Tools


- 🦙 **Ollama** – Local Large Language Model execution
- 🧠 **Llama 3** – Large Language Model for AI responses
- 👁️ **LLaVA** – Vision-language model
- 🔤 **Sentence Transformers** – Text embedding generation
- 🧩 **all-MiniLM-L6-v2** – Sentence embedding model
- 🔗 **nomic-embed-text** – Text embedding model


---


# 🧠 RAG & Semantic Search


NyayaKosh uses a **Retrieval-Augmented Generation (RAG)** architecture to retrieve relevant information from uploaded legal documents before generating an AI response.


### Technologies


- 🧠 Retrieval-Augmented Generation (RAG)
- 🗄️ ChromaDB
- 🔢 Vector Embeddings
- 🔍 Semantic Search


### 🔄 RAG Workflow


```text
📄 Legal Documents
        ↓
📥 Document Upload
        ↓
📑 Text Extraction / OCR
        ↓
✂️ Document Chunking
        ↓
🧠 Embedding Generation
        ↓
🗄️ ChromaDB
        ↓
❓ User Query
        ↓
🔍 Semantic Search
        ↓
📚 Relevant Context
        ↓
🦙 Ollama / Llama 3
        ↓
💬 AI Generated Answer
📑 Document Processing

NyayaKosh supports multiple document processing techniques.

Technologies
📑 Tesseract OCR – Extract text from scanned documents
📕 PyMuPDF – PDF processing
📄 PyPDF – PDF text extraction
📝 python-docx – DOCX document processing
🖼️ Pillow – Image processing
Supported Processing
📕 PDF documents
📘 DOC / DOCX documents
📄 TXT documents
🖼️ Scanned and image-based documents
📦 ZIP document uploads
🔍 Document Processing Workflow
📄 Upload Document
        ↓
🔎 Detect Document Type
        ↓
📑 Extract Text
        ↓
🖼️ OCR if Required
        ↓
✂️ Split into Chunks
        ↓
🧠 Generate Embeddings
        ↓
🗄️ Store in Vector Database
🗄️ Database & Storage

NyayaKosh uses two main storage technologies.

💾 SQLite

SQLite is used for:

📄 Document metadata
📁 Workspace information
⚙️ Application metadata
🧠 ChromaDB

ChromaDB is used for:

🔢 Vector embeddings
🔍 Semantic document retrieval
🧠 RAG context retrieval
🐍 Backend Setup
1️⃣ Navigate to Backend
cd backend
2️⃣ Create Virtual Environment
python -m venv venv
3️⃣ Activate Virtual Environment
Windows
venv\Scripts\activate
Linux / macOS
source venv/bin/activate
4️⃣ Install Dependencies
pip install -r requirements.txt

If required:

pip install sentence-transformers
🦙 Ollama Setup

NyayaKosh uses Ollama to run the Large Language Model locally.

Download Llama 3
ollama pull llama3
Check Installed Models
ollama list

Ollama normally runs at:

http://localhost:11434
▶️ Run Backend

From the backend directory:

uvicorn app.main:app --reload
Backend URL
http://localhost:8000
FastAPI Documentation
http://localhost:8000/docs
⚛️ Frontend Setup

Open a new terminal and navigate to the frontend:

cd frontend
Install Dependencies
npm install
Start Frontend
npm run dev

The frontend normally runs at:

http://localhost:5173
🔌 API Endpoints
Method	Endpoint	Description
GET	/	Check backend status
POST	/api/chat/stream	Process user queries and generate AI responses
POST	/api/documents/upload	Upload and process documents
🔐 Privacy & Security

NyayaKosh uses Ollama for local LLM inference, allowing AI processing to take place locally.

This approach is designed to support privacy-oriented processing of sensitive legal documents without requiring external cloud-based LLM inference.

For production deployment, additional security features should be considered:

🔐 Authentication
👤 User authorization
🔒 Data encryption
🛡️ Secure file handling
🌐 Network security
📋 Access control
🧩 Complete Technology Overview
Category	Technologies
🎨 Frontend	React.js, Vite, Tailwind CSS, Framer Motion
⚙️ Backend	Python, FastAPI, Uvicorn, Pydantic
🤖 AI/ML	Ollama, Llama 3, LLaVA, Sentence Transformers
🧠 RAG	RAG, Vector Embeddings, Semantic Search
🗄️ Vector Database	ChromaDB
💾 Database	SQLite
📑 OCR	Tesseract OCR
📄 Document Processing	PyMuPDF, PyPDF, python-docx
🖼️ Image Processing	Pillow
🔧 Development	Git, GitHub, VS Code
