import os
import uuid
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from unstructured.partition.pdf import partition_pdf
from unstructured.documents.elements import CompositeElement, Table, Image
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

app = FastAPI(title="Multi-PDF RAG API")
@app.get("/")
def read_root():
    return {"message": "Hello World! Your API is working."}
# --- Configuration ---
os.environ["GOOGLE_API_KEY"] = "AIzaSyAYffcm1Ga32V1UA2hZdQyGugD7fJtTb-o"
model = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

vectorstore = None
retriever = None

class QueryRequest(BaseModel):
    question: str

# --- Helper Functions ---

def process_pdf(file_path: str):
    """Partitions PDF into text, tables, and images."""
    chunks = partition_pdf(
        filename=file_path,
        infer_table_structure=True,
        strategy="hi_res",
        extract_image_block_types=["Image", "Table"],
        extract_image_block_to_payload=True,
        chunking_strategy="by_title",
        max_characters=10000,
        combine_text_under_n_chars=2000,
        new_after_n_chars=6000,
    )
    
    texts = [el for el in chunks if isinstance(el, CompositeElement)]
    tables = [el for el in chunks if isinstance(el, Table)]
    images = [el.metadata.image_base64 for el in chunks if isinstance(el, Image) and el.metadata.image_base64]
    
    return texts, tables, images

def create_documents(texts, tables, images):
    """Generates summaries and creates LangChain Documents."""
    docs = []
    
    # Process Text
    for t in texts:
        summary = model.invoke(f"Summarize this text: {t.text}").content
        docs.append(Document(page_content=summary, metadata={"type": "text", "original": t.text}))
    
    # Process Tables
    for t in tables:
        summary = model.invoke(f"Summarize this table: {t.metadata.text_as_html}").content
        docs.append(Document(page_content=summary, metadata={"type": "table", "original": t.metadata.text_as_html}))
    
    # Process Images
    for b64 in images:
        msg = model.invoke([
            HumanMessage(content=[
                {"type": "text", "text": "Describe this technical diagram in detail."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
            ])
        ])
        docs.append(Document(page_content=msg.content, metadata={"type": "image", "b64": b64}))
        
    return docs

@app.post("/upload-pdfs/")
async def upload_files(files: List[UploadFile] = File(...)):
    global vectorstore, retriever
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Please upload only 5 files .")

    all_docs = []
    
    for file in files:
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            # 1. Partition
            texts, tables, images = process_pdf(temp_file)
            # 2. Summarize and Create Docs
            new_docs = create_documents(texts, tables, images)
            all_docs.extend(new_docs)
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)

    # 3. Build/Update Vectorstore
    if vectorstore is None:
        vectorstore = FAISS.from_documents(all_docs, embeddings)
    else:
        vectorstore.add_documents(all_docs)
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    
    return {"message": f"Successfully processed {len(files)} files and updated the index."}

@app.post("/query/")
async def query_rag(request: QueryRequest):
    if retriever is None:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")
    
    relevant_docs = retriever.invoke(request.question)
    
    context = ""
    for doc in relevant_docs:
        if doc.metadata["type"] == "text":
            context += f"\n[TEXT]: {doc.metadata['original']}"
        elif doc.metadata["type"] == "table":
            context += f"\n[TABLE]: {doc.metadata['original']}"
        elif doc.metadata["type"] == "image":
            context += f"\n[IMAGE DESCRIPTION]: {doc.page_content}"

    prompt = f"Answer the question using ONLY the context provided.\nContext: {context}\nQuestion: {request.question}"
    answer = model.invoke(prompt).content
    
    return {"question": request.question, "answer": answer}

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
