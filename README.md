<p align="center">
  <h1 align="center">🚀 RAG-Powered Assistant</h1>
  <p align="center">
    A production-ready Retrieval-Augmented Generation (RAG) system for Question Answering using Documents containg text,tables and images
  </p>
</p>

![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![FAISS](https://img.shields.io/badge/VectorDB-FAISS-orange)
![LLM](https://img.shields.io/badge/LLM-Gemini%20%7C%20ChatGPT-purple)
![Deployment](https://img.shields.io/badge/Deployed-Vercel-black)

---

## 📌 Overview

The **Mini RAG-Powered Assistant** is a **Retrieval-Augmented Generation (RAG)** based system that answers user queries using a **custom document corpus**.

It combines:
- 🔍 **Semantic search**
- 🧠 **Vector embeddings**
- 🤖 **Large Language Models (LLMs)**

to deliver **accurate, grounded, and context-aware responses** with reduced hallucinations.

---

## 🖥️ Application Preview

> End-to-end RAG pipeline demonstrating document ingestion, semantic retrieval, and grounded LLM responses.

<img width="300" height="900" alt="Streamlit RAG Chat Pipeline" src="https://github.com/user-attachments/assets/ca94bade-3391-4a0a-af0b-da07643a37ff" />

---

## 🧠 Retrieval Pipeline

User Query  
→ Query Vectorization  
→ Intelligent Chunking  
→ Content Summarization  
→ Semantic Similarity Search (FAISS)  
→ **Top-K Relevant Context Blocks**



## ✨ Key Features

📄 **Multi-format document support**
- PDFs / Word documents
- Text, Tables, and Images

🧠 **Semantic understanding**
- High-quality vector embeddings
- Meaning-based retrieval instead of keyword search

🔍 **Accurate context retrieval**
- FAISS-powered similarity search
- Top-K relevant content selection

🤖 **Grounded LLM responses**
- Context-aware answers
- Reduced hallucinations by design

☁️ **Cloud-ready & scalable**
- Stateless backend architecture
- Horizontal scaling supported

⚙️ **Modular & extensible**
- Easy to swap embeddings, vector databases, or LLMs

---

## 🛠️ Tech Stack

- **Backend**: FastAPI  
- **Frontend**: Streamlit  
- **LLM**: Gemini / ChatGPT  
- **Embeddings**: Gemini Embedding API  
- **Vector Database**: FAISS  
- **Document Processing**: Unstructured  
- **Deployment**: Vercel  

---

## ⚡ Quick Start

### Prerequisites
- Python **3.9+**
- Git
- FAISS
- OpenAI / Gemini API Key

### Installation

```bash
git clone https://github.com/rahulpr7/HCL-RAG.git
cd HCL-RAG
pip install -r requirements.txt


