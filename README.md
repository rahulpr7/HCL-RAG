# Mini RAG-Powered Assistant
A Retrieval-Augmented Generation (RAG) based assistant that answers user queries using a custom document corpus by combining semantic search with Large Language Models (LLMs).

This project demonstrates a deployable, scalable, and modular GenAI pipeline, suitable for real-world applications.

<img width="300" height="900" alt="Streamlit RAG Chat Pipeline-2025-12-19-082856" src="https://github.com/user-attachments/assets/ca94bade-3391-4a0a-af0b-da07643a37ff" />

How Retrievel works?

Query Vector
   ↓
Cosine Similarity
   ↓
Top-K Pages
   ↓
Cosine Similarity
   ↓
Top-K Paragraphs

🚀 Features

📄 Supports custom document corpus (PDFs / text)

🧠 Semantic search using vector embeddings

🔍 Accurate context retrieval via similarity search

🤖 Grounded LLM responses (reduced hallucinations)

☁️ Cloud-deployable and horizontally scalable

🔄 Modular architecture (easy to swap components)

⚙️ Setup & Deployment : 

Prerequisites:
Python 3.9+,
Git,
OpenAI API key,
FAISS.

⚡ Challenges Faced and Resolutions

Chunking Strategy:

Challenge: How to divide documents to retrieve most relevant parts efficiently

Resolution: Adopted hierarchical chunking – first select relevant pages, then extract top paragraphs, considering the input query for context

Embedding Model Selection:

Challenge: Choosing a model that works for query, page, and paragraph embeddings

Resolution: Chose OpenAI embedding model for consistency and strong semantic understanding across all levels

Vector Database Choice:

Challenge: Finding a database that is fast, lightweight, and integrates well with hierarchical retrieval

Resolution: Selected FAISS due to its local in-memory speed, simplicity, and suitability for hierarchical chunking

Generation Strategy:

Challenge: How to generate accurate, personalized responses using retrieved content

Resolution: Augmented user’s original prompt with retrieved document chunks and used ChatGPT for inference

Frontend Framework Selection

Challenge: Choosing a frontend framework under time constraints

Resolution: Streamlit was chosen for its simplicity, lightweight nature, and rapid development capability

Exception Handling

Challenge: Preventing errors due to unexpected inputs, excessive or insufficient documents/pages

Resolution: Added try/except blocks in frontend; restricted document number (1–5) and page count per document (1–30) to handle edge cases gracefully

☁️ Deployment

The application is stateless and cloud-ready, enabling horizontal scaling.

Deploy on Azure App Service, AWS, or Docker

Configure the same environment variables in the cloud dashboard

No code changes are required for deployment

✅ Summary

This Mini RAG-Powered Assistant follows industry-standard GenAI architecture, ensuring:

Accurate, context-aware responses

Easy scalability

Clean separation of retrieval and generation

Cloud-native deployment readiness

