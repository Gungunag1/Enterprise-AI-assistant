# 🤖 Enterprise AI Knowledge Assistant

An intelligent **Retrieval-Augmented Generation (RAG)** based AI assistant that allows users to upload documents and ask questions using natural language.

The system uses **semantic search with FAISS** to retrieve relevant information from uploaded documents and generates answers using **Llama 3.2 through Ollama**.

---

## 🚀 Live Demo

🔗 [Open Live Application](YOUR_DEPLOYMENT_URL)

---

## 📸 Screenshots


---

### 📚 Knowledge Base

![Knowledge Base](screenshots/knowledge-base.png)

---

### 💬 AI Chat

![AI Chat](screenshots/chat.png)

---

### 📊 Analytics Dashboard

![Analytics](screenshots/analytics.png)

---

## ✨ Features

* 📄 Upload PDF, DOCX and TXT documents
* 🔍 Semantic document search using FAISS
* 🧠 Retrieval-Augmented Generation (RAG)
* 🤖 Llama 3.2 powered question answering
* 🏠 Local LLM inference using Ollama
* 🗄️ PostgreSQL database
* 💬 Persistent chat history
* 📊 Analytics dashboard
* ⚡ Response-time monitoring
* 🔗 Source document tracking
* 🌐 REST APIs using FastAPI

---

## 🏗️ Architecture

```text
                 ┌──────────────────────┐
                 │       Frontend       │
                 │      HTML/CSS/JS     │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │       FastAPI        │
                 │       Backend        │
                 └──────────┬───────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │   FAISS  │   │  Ollama  │
        │ Database │   │  Vector  │   │ Llama 3.2│
        └──────────┘   │  Store   │   └──────────┘
                       └────┬─────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Sentence Transformers│
                 │      Embeddings      │
                 └──────────────────────┘
```

---

## 🔄 RAG Pipeline

```text
User Question
      │
      ▼
Query Embedding
      │
      ▼
FAISS Semantic Search
      │
      ▼
Relevant Document Chunks
      │
      ▼
Context Construction
      │
      ▼
Llama 3.2 via Ollama
      │
      ▼
Generated Answer
      │
      ▼
User
```

---

## 📄 Document Processing Pipeline

```text
PDF / DOCX / TXT
       │
       ▼
Text Extraction
       │
       ▼
Text Chunking
       │
       ▼
Sentence Transformers
       │
       ▼
Vector Embeddings
       │
       ▼
FAISS Index
       │
       ▼
Relevant Document Chunks
```

---

## 🛠️ Tech Stack

| Category         | Technologies            |
| ---------------- | ----------------------- |
| Language         | Python                  |
| Frontend         | HTML5, CSS3, JavaScript |
| Backend          | FastAPI                 |
| LLM              | Llama 3.2               |
| LLM Runtime      | Ollama                  |
| Embeddings       | Sentence Transformers   |
| Vector Database  | FAISS                   |
| Database         | PostgreSQL              |
| API              | REST API                |
| Containerization | Docker                  |
| Architecture     | RAG                     |

---

## 📁 Project Structure

```text
enterprise-ai-knowledge-assistant/
│
├── app/
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── rag.py
│   └── schemas.py
│
├── data/
│   ├── uploads/
│   └── faiss_index/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── screenshots/
│   ├── dashboard.png
│   ├── knowledge-base.png
│   ├── chat.png
│   └── analytics.png
│
├── docker-compose.yml
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd enterprise-ai-knowledge-assistant
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

#### Windows

```powershell
.\venv\Scripts\Activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Start PostgreSQL

Make sure Docker Desktop is running.

```bash
docker compose up -d
```

Check the container:

```bash
docker ps
```

### 5. Install and Start Ollama

Pull the Llama 3.2 model:

```bash
ollama pull llama3.2
```

Verify:

```bash
ollama list
```

### 6. Start FastAPI Backend

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Backend will run at:

```text
http://127.0.0.1:8001
```

Swagger API documentation:

```text
http://127.0.0.1:8001/docs
```

### 7. Start Frontend

Open another terminal:

```bash
cd frontend
python -m http.server 5500
```

Open:

```text
http://127.0.0.1:5500
```

---

## 🔐 Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5434/chatbot_db

OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=llama3.2

UPLOAD_DIR=data/uploads
VECTOR_STORE_PATH=data/faiss_index
```

---

## 🌐 API Endpoints

| Method | Endpoint     | Description                |
| ------ | ------------ | -------------------------- |
| GET    | `/`          | Check API status           |
| POST   | `/upload`    | Upload and index documents |
| POST   | `/chat`      | Ask questions              |
| GET    | `/documents` | Get uploaded documents     |
| GET    | `/history`   | Get chat history           |
| GET    | `/analytics` | Get system analytics       |

---

## 💬 Example API Request

### Chat

```http
POST /chat
Content-Type: application/json
```

```json
{
  "question": "What skills are mentioned in the document?"
}
```

Example response:

```json
{
  "answer": "The document mentions Python, Java, SQL and Machine Learning.",
  "sources": [
    "Gungun_agrawal.pdf"
  ]
}
```

---

## 📤 Document Upload

```http
POST /upload
Content-Type: multipart/form-data
```

Example response:

```json
{
  "message": "Document uploaded and indexed successfully",
  "filename": "Gungun_agrawal.pdf",
  "chunks_created": 10
}
```

---

## 📊 Analytics

The application provides an analytics dashboard for monitoring system usage and performance.

### Metrics

* Total Questions
* Total Documents
* Total Indexed Chunks
* Successful Responses
* Failed Responses
* Average Response Time
* Question History

---

## 🔒 Security

The current implementation is primarily designed for **local development and portfolio demonstration**.

For production deployment, the following security improvements can be added:

* JWT Authentication
* Role-Based Access Control
* File type validation
* File size limits
* Rate limiting
* HTTPS
* Secure secret management
* Input validation

---

## 🚀 Future Improvements

* 🔎 Hybrid Search using BM25 + Vector Search
* 🎯 Cross-Encoder Reranking
* 🔄 Query Rewriting
* 🧠 Multi-document conversational RAG
* 🔐 JWT Authentication
* 👥 Role-Based Access Control
* ⚡ Streaming LLM Responses
* 🚀 Redis Caching
* ⚙️ Background Document Processing
* 📈 Advanced RAG Evaluation
* ☁️ AWS Cloud Deployment
* ☸️ Kubernetes Deployment
* 🔄 CI/CD Pipeline

---

## 🎯 Project Highlights

This project demonstrates practical implementation of:

* Retrieval-Augmented Generation
* Semantic Search
* Vector Embeddings
* Vector Similarity Search
* Local LLM Deployment
* REST API Development
* Database Integration
* Document Processing
* AI Application Architecture
* Performance Monitoring

---

## 👩‍💻 Author

**Gungun Agrawal**

CSE-AIML | Software Developer | AI/ML Enthusiast

* GitHub: [YOUR_GITHUB_PROFILE](YOUR_GITHUB_PROFILE)
* LinkedIn: [YOUR_LINKEDIN_PROFILE](YOUR_LINKEDIN_PROFILE)

---

## 📄 License

This project is intended for educational, learning and portfolio purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ star.
