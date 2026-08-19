# Nyayakosh---AI-powered-legal-document-repository-and-retrieval-system
# ⚖️ NyayaKosh – AI-Powered Legal Document Repository

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
