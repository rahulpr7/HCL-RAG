import { Attachment, PipelineStage } from '../types';
import { validateUpload } from './validationService';
import { uploadDocumentsToBackend, queryBackend } from './geminiService';
import { DEFAULT_MODEL } from '../constants';

/**
 * NoOverfitBackend
 * 
 * Orchestrates the pipeline: Validation -> Local Storage -> API Inference.
 */
export class NoOverfitBackend {
  private _status: PipelineStage = 'idle';
  private _statusListeners: ((status: PipelineStage) => void)[] = [];
  
  // In-memory "Document Store" for UI previews and context
  private documentStore: Attachment[] = [];

  constructor() {}

  public onStatusChange(callback: (status: PipelineStage) => void) {
    this._statusListeners.push(callback);
    return () => {
      this._statusListeners = this._statusListeners.filter(cb => cb !== callback);
    };
  }

  private setStatus(status: PipelineStage) {
    this._status = status;
    this._statusListeners.forEach(cb => cb(status));
  }

  /**
   * 1. UPLOAD & VALIDATION LAYER
   */
  public async ingestDocuments(newFiles: File[]): Promise<{ success: boolean; errors?: string[] }> {
    this.setStatus('validating');
    
    try {
      // 1. Client-side Validation (Size, Type)
      const { validFiles, errors } = await validateUpload(newFiles, this.documentStore);
      
      if (validFiles.length === 0) {
        this.setStatus('error');
        // Reset to idle after a moment if it was just a validation error
        setTimeout(() => this.setStatus('idle'), 2000); 
        return { success: false, errors: errors.length > 0 ? errors : ['No valid files'] };
      }

      // 2. "Ingest" (Process locally for Base64)
      this.setStatus('ingesting');
      
      const newAttachments: Attachment[] = [];
      for (const file of validFiles) {
        const base64 = await this.readFileToBase64(file);
        newAttachments.push({
          id: Math.random().toString(36).substring(7),
          file,
          base64,
          mimeType: file.type,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        });
      }
      this.documentStore = [...this.documentStore, ...newAttachments];
      
      // Artificial delay to show "Ingestion" complete
      await uploadDocumentsToBackend(validFiles);

      this.setStatus('idle');
      return { success: true, errors: errors.length > 0 ? errors : undefined };

    } catch (error: any) {
      console.error(error);
      this.setStatus('error');
      return { success: false, errors: [error.message || 'Ingestion failed'] };
    }
  }

  public getDocuments(): Attachment[] {
    return this.documentStore;
  }

  public removeDocument(id: string) {
    this.documentStore = this.documentStore.filter(doc => doc.id !== id);
  }

  public clearDocuments() {
    this.documentStore = [];
  }

  /**
   * 2. INFERENCE LAYER
   * Updated to optionally accept explicit documents to allow UI to clear early.
   */
  public async chat(query: string, model: string = DEFAULT_MODEL, overrideDocs?: Attachment[]): Promise<string> {
    if (!query.trim()) return "";

    // Use provided docs or fall back to store (captured synchronously)
    const contextDocuments = overrideDocs || [...this.documentStore];

    try {
      this.setStatus('retrieving');
      
      // We wrap the delay and query in a promise, but use the captured contextDocuments
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.setStatus('reasoning');
      
      // Pass captured documents as context
      const response = await queryBackend(query, model, contextDocuments);
      
      this.setStatus('complete');
      setTimeout(() => this.setStatus('idle'), 2000);
      
      return response;

    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  private readFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export a singleton instance
export const backend = new NoOverfitBackend();