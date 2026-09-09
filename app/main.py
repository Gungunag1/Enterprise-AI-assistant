import faiss
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import requests
import time

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException
)
from app.rag import (
    extract_text,
    chunk_text,
    create_vector_store,
    search_documents,
    generate_answer
)

from sqlalchemy.orm import Session

from app.database import (
    engine,
    Base,
    get_db
)

from app.models import (
    Document,
    ChatHistory
)

from app.schemas import (
    QuestionRequest,
    ChatResponse
)

from app.rag import (
    extract_text,
    chunk_text,
    create_vector_store,
    search_documents,
    generate_answer
)

from app.config import settings


# Create database tables

Base.metadata.create_all(
    bind=engine
)


# Create FastAPI application

app = FastAPI(

    title="Enterprise AI Knowledge Assistant",

    version="1.0.0"
)

@app.on_event("startup")
def warm_up_model():

    try:

        requests.post(

            f"{settings.OLLAMA_URL}/api/generate",

            json={

                "model": settings.OLLAMA_MODEL,

                "prompt": "Hello",

                "stream": False,

                "options": {
                    "num_predict": 1
                }

            },

            timeout=120

        )

        print("Ollama model warmed up")

    except Exception as error:

        print(
            "Ollama warmup failed:",
            error
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://enterprisea.netlify.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000/frontend/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directory

os.makedirs(
    settings.UPLOAD_DIR,
    exist_ok=True
)


@app.get("/")

def home():

    return {

        "message":
        "Enterprise AI Knowledge Assistant is running"
    }


@app.post("/upload")

async def upload_document(

    file: UploadFile = File(...),

    db: Session = Depends(get_db)

):

    allowed_extensions = [
        "pdf",
        "docx",
        "txt"
    ]


    extension = file.filename.split(
        "."
    )[-1].lower()


    if extension not in allowed_extensions:

        raise HTTPException(

            status_code=400,

            detail=
            "Only PDF, DOCX and TXT files are allowed"
        )


    file_path = os.path.join(

        settings.UPLOAD_DIR,

        file.filename
    )


    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    try:

        text = extract_text(
            file_path
        )


        if not text.strip():

            raise ValueError(
                "No readable text found"
            )


        chunks = chunk_text(
            text
        )


        create_vector_store(

            chunks,

            file.filename
        )


        document = Document(

            filename=file.filename,
            chunk_count=len(chunks)
        )


        db.add(
            document
        )

        db.commit()


        return {

            "message":
            "Document uploaded and indexed successfully",

            "filename":
            file.filename,

            "chunks_created":
            len(chunks)
        }


    except Exception as error:

        raise HTTPException(

            status_code=500,

            detail=str(error)
        )


@app.post("/chat", response_model=ChatResponse)
def chat(request: QuestionRequest, db: Session = Depends(get_db)):

    start_time = time.perf_counter()

    # Retrieval timing
    retrieval_start = time.perf_counter()

    results = search_documents(request.question)

    retrieval_time = time.perf_counter() - retrieval_start

    if not results:
        return {
            "answer": "No documents have been uploaded yet.",
            "sources": []
        }

    context = "\n\n".join(item["text"] for item in results)

    # LLM timing
    llm_start = time.perf_counter()

    answer = generate_answer(
        request.question,
        context
    )

    llm_time = time.perf_counter() - llm_start

    # Total timing
    total_time = time.perf_counter() - start_time

    print("\n----------------------------------")
    print("RAG PERFORMANCE")
    print(f"Retrieval : {retrieval_time:.3f}s")
    print(f"LLM       : {llm_time:.3f}s")
    print(f"Total     : {total_time:.3f}s")
    print("----------------------------------\n")

    sources = list(
        set(item["source"] for item in results)
    )

    chat_history = ChatHistory(
        question=request.question,
        answer=answer
    )

    db.add(chat_history)
    db.commit()

    return {
        "answer": answer,
        "sources": sources
    }



@app.get("/documents")
def get_documents(
db: Session = Depends(get_db)
):
  documents = db.query(
Document
).order_by(
Document.id.desc()
).all()


  return [
    {
        "id": document.id,
        "filename": document.filename,
         "chunks": document.chunk_count,
        "uploaded_at": document.uploaded_at
    }
    for document in documents
]




@app.get("/history")

def get_chat_history(

    db: Session = Depends(get_db)

):

    history = db.query(

        ChatHistory

    ).order_by(

        ChatHistory.id.desc()

    ).all()


    return history


@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    total_documents = db.query(Document).count()
    total_questions = db.query(ChatHistory).count()

    index_path = os.path.join(
        settings.VECTOR_STORE_PATH,
        "index.faiss"
    )

    indexed_chunks = 0

    if os.path.exists(index_path):
        index = faiss.read_index(index_path)
        indexed_chunks = index.ntotal

    return {
        "total_documents": total_documents,
        "indexed_chunks": indexed_chunks,
        "total_questions": total_questions,
        "model": settings.OLLAMA_MODEL
    }
