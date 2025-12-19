import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 file uploads

// Initialize Gemini SDK on Server Side
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing on server.");
  }
  return new GoogleGenAI({ apiKey });
};

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const SYSTEM_INSTRUCTION = `
You are NoOverfit.AI, an intelligent document analysis assistant acting as a RAG (Retrieval-Augmented Generation) system.

**PIPELINE INSTRUCTIONS:**

1.  **CONTEXT AUGMENTATION:**
    - You will receive documents that have passed strict validation.
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

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, attachments, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIInstance();
    const parts = [];

    // 1. Reconstruct parts from attachments
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        // Handle base64 string stripping if necessary, though frontend usually sends clean data or data url
        const base64Data = att.base64.includes(',') 
          ? att.base64.split(',')[1] 
          : att.base64;
          
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: base64Data
          }
        });
      }
    }

    // 2. Add prompt
    parts.push({ text: `User Query: ${prompt}` });

    // 3. Call Gemini
    const modelToUse = model || DEFAULT_MODEL;
    
    // Add Thinking Config if using a thinking model
    const config = {
       systemInstruction: SYSTEM_INSTRUCTION,
    };
    
    if (modelToUse.includes('thinking')) {
        // @ts-ignore - Dynamic config
        config.thinkingConfig = { thinkingBudget: 1024 }; 
    }

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: { parts },
      config: config
    });

    res.json({ text: response.text });

  } catch (error) {
    console.error('Backend Inference Error:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during processing.',
      details: error.toString()
    });
  }
});

app.listen(port, () => {
  console.log(`NoOverfit.AI Backend running on http://localhost:${port}`);
});