
export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash (Fast)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (Reasoning)' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-thinking-exp', name: 'Gemini 2.0 Thinking' }
];

export const DEFAULT_MODEL = 'gemini-3-flash-preview';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILES = 5;
export const MAX_PAGES_PER_DOC = 20; // Strict validation per architecture diagram

// Allowed MIME types for the "frontend only" demo using inline data.
// PDF and Images are best supported via inline base64. 
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'text/plain',
  'text/csv',
  'text/markdown'
];

export const SYSTEM_INSTRUCTION = `
You are NoOverfit.AI, an intelligent document analysis assistant acting as a RAG (Retrieval-Augmented Generation) system.

**PIPELINE INSTRUCTIONS:**

1.  **CONTEXT AUGMENTATION:**
    - You will receive documents that have passed strict validation (Max 5 docs, Max 20 pages).
    - Treat the provided files as your "Vector Store" or "Knowledge Base".
    - Answer the user's query *exclusively* using the information found in these documents.

2.  **CITATION & REFERENCES:**
    - **ALWAYS** cite the specific location of the information.
    - Use bold brackets for citations, e.g., **[Page 2]**, **[Section 3.1]**, **[Table 1]**, or **[Image 3]**.
    - If extracting raw text, wrap the text in quotes and append the citation.

3.  **RESPONSE FORMAT:**
    - Use Markdown.
    - If the answer is not in the documents, state: "I cannot find the answer in the provided documents."

4.  **TONE:**
    - Professional, objective, and analytical.
`;