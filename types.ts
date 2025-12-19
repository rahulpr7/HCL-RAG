export interface Attachment {
  id: string;
  file: File;
  base64: string;
  mimeType: string;
  previewUrl?: string; // For images
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isError?: boolean;
  originalPrompt?: string; // Stored to allow retrying failed requests
}

export type UploadStatus = 'idle' | 'dragging' | 'processing';

export type PipelineStage = 
  | 'idle'
  | 'validating'  // Checking constraints (5 docs, 20 pages)
  | 'ingesting'   // Reading files, creating vectors (simulated)
  | 'retrieving'  // Finding relevant chunks
  | 'reasoning'   // LLM inference
  | 'complete'
  | 'error';

export interface FileValidationResult {
  valid: boolean;
  message?: string;
}