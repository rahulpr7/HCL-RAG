import { Attachment } from '../types';

/**
 * Uploads files (No-op in Node.js Direct Context mode).
 * We simply resolve because files are sent with the chat request.
 */
export const uploadDocumentsToBackend = async (files: File[]): Promise<void> => {
  // Simulating network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 600)); 
  return Promise.resolve();
};

/**
 * Sends a query + attachments to the Node.js Backend.
 */
export const queryBackend = async (
  question: string,
  modelName: string,
  attachments: Attachment[] = []
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: question,
        model: modelName,
        attachments: attachments.map(att => ({
          mimeType: att.mimeType,
          base64: att.base64
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.text || "No response received.";

  } catch (error: any) {
    console.error("Query Service Error:", error);
    throw new Error(error.message || "Failed to communicate with AI server.");
  }
};

// Wrapper for backward compatibility if needed
export const generateResponse = async (prompt: string, model: string, attachments: Attachment[]) => {
    return queryBackend(prompt, model, attachments);
}