import os
import pickle
import requests
import numpy as np
import faiss

from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from docx import Document

from app.config import settings


# =========================
# LOAD EMBEDDING MODEL
# =========================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# =========================
# EXTRACT TEXT
# =========================

def extract_text(file_path: str) -> str:

    extension = file_path.split(".")[-1].lower()


    if extension == "pdf":

        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"


        return text


    elif extension == "docx":

        document = Document(file_path)

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )


    elif extension == "txt":

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            return file.read()


    else:

        raise ValueError(
            "Only PDF, DOCX and TXT files are supported"
        )


# =========================
# CHUNK TEXT
# =========================

def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 100
):

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end]

        if chunk.strip():

            chunks.append(
                chunk
            )

        start += (
            chunk_size - overlap
        )

    return chunks



# =========================
# CREATE VECTOR STORE
# =========================

def create_vector_store(
    chunks,
    filename
):

    os.makedirs(
        settings.VECTOR_STORE_PATH,
        exist_ok=True
    )


    index_path = os.path.join(
        settings.VECTOR_STORE_PATH,
        "index.faiss"
    )


    metadata_path = os.path.join(
        settings.VECTOR_STORE_PATH,
        "metadata.pkl"
    )


    # Create embeddings

   
    embeddings = embedding_model.encode(

    chunks,

    convert_to_numpy=True,

    normalize_embeddings=True

).astype(
    "float32"
)


    # Load existing vector store

    if (
        os.path.exists(index_path)
        and
        os.path.exists(metadata_path)
    ):

        index = faiss.read_index(
            index_path
        )


        with open(
            metadata_path,
            "rb"
        ) as file:

            metadata = pickle.load(
                file
            )


    else:

        dimension = embeddings.shape[1]


        # Inner product for cosine similarity

        index = faiss.IndexFlatIP(
            dimension
        )


        metadata = []


    # Add embeddings

    index.add(
        embeddings
    )


    # Add metadata

    for chunk in chunks:

        metadata.append(

            {
                "text": chunk,

                "source": filename
            }

        )


    # Save FAISS

    faiss.write_index(

        index,

        index_path

    )


    # Save metadata

    with open(
        metadata_path,
        "wb"
    ) as file:

        pickle.dump(

            metadata,

            file

        )


# =========================
# SEARCH DOCUMENTS
# =========================


def search_documents(
    query: str,
    top_k: int = 2
):

    index_path = os.path.join(
        settings.VECTOR_STORE_PATH,
        "index.faiss"
    )

    metadata_path = os.path.join(
        settings.VECTOR_STORE_PATH,
        "metadata.pkl"
    )


    if not os.path.exists(index_path):

        return []


    index = faiss.read_index(
        index_path
    )


    with open(
        metadata_path,
        "rb"
    ) as file:

        metadata = pickle.load(
            file
        )


    query_embedding = embedding_model.encode(

        [query],

        convert_to_numpy=True,

        normalize_embeddings=True

    ).astype(
        "float32"
    )


    distances, indices = index.search(

        query_embedding,

        min(
            top_k,
            len(metadata)
        )

    )


    results = []


    for index_id in indices[0]:

        if index_id != -1:

            results.append(
                metadata[index_id]
            )


    return results


# =========================
# GENERATE ANSWER
# =========================


def generate_answer(
    question: str,
    context: str
):

    prompt = f"""
Use the context to answer the question.
If the answer is not in the context, say:
"I could not find the answer in the uploaded documents."

Context:
{context}

Question:
{question}

Answer:
"""


    response = requests.post(

        f"{settings.OLLAMA_URL}/api/generate",

        json={

            "model": settings.OLLAMA_MODEL,

            "prompt": prompt,

            "stream": False,

            "options": {

                "temperature": 0,

                "num_predict": 80,

                "num_ctx": 1024

            }

        },

        timeout=120

    )


    response.raise_for_status()


    return response.json()["response"].strip()













