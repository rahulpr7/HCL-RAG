import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// 1. Robust Environment Loading
// Try loading .env and .env.local from the current directory
dotenv.config();
dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

// Increase payload limit for large PDFs/Images
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// 2. Robust API Key Retrieval
const getAIInstance = () => {
  // Check common variable names for the key
  const apiKey = process.env.API_KEY || 
                 process.env.GOOGLE_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key not found. Please create a .env file in the root directory with API_KEY=your_google_api_key");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are NoOverfit.AI, an advanced document analysis assistant.

**INSTRUCTIONS:**
1.  **Context:** You are provided with user-uploaded documents (PDFs, Images, Text). Use them as your primary source of truth.
2.  **Analysis:** Analyze the content deeply. If it's a technical diagram, describe it. If it's a legal doc, summarize clauses.
3.  **Citation:** When answering based on the documents, cite the page number or section if possible (e.g., [Page 2]).
4.  **Format:** Use professional Markdown. Use tables for structured data.
`;

app.get('/', (req, res) => {
  res.send('NoOverfit.AI Node Backend is running');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, attachments, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIInstance();
    const parts = [];

    // 1. Process Attachments (PDFs, Images, Text)
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        // Strip data URI prefix if present
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

    // 2. Add User Prompt
    parts.push({ text: prompt });

    // 3. Configure Model
    const modelToUse = model || 'gemini-1.5-flash';
    
    const config = {
       systemInstruction: SYSTEM_INSTRUCTION,
    };
    
    // Add Thinking Config if using a thinking model
    if (modelToUse.includes('thinking')) {
        // @ts-ignore
        config.thinkingConfig = { thinkingBudget: 1024 }; 
    }

    // 4. Generate Content
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: { parts },
      config: config
    });

    res.json({ text: response.text });

  } catch (error) {
    console.error('Backend Inference Error:', error);
    
    // Send a helpful error message to the frontend
    const errorMessage = error.message.includes('API Key') 
      ? 'Server Configuration Error: API Key is missing. Please check the server logs.'
      : error.message || 'An error occurred during processing.';

    res.status(500).json({ 
      error: errorMessage,
      details: error.toString()
    });
  }
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`NoOverfit.AI Backend running on http://localhost:${port}`);
      
      // Log warning if key is missing on startup
      const keyCheck = process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
      if (!keyCheck) {
        console.warn("\x1b[33m%s\x1b[0m", "WARNING: API_KEY is not set. Requests will fail until a .env file is created.");
      } else {
        console.log("\x1b[32m%s\x1b[0m", "API_KEY loaded successfully.");
      }
    });
}

export default app;