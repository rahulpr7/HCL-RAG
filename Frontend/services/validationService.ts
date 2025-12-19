import * as pdfjsLib from 'pdfjs-dist';
import { MAX_FILE_SIZE_MB, MAX_FILES, MAX_PAGES_PER_DOC, ALLOWED_MIME_TYPES } from '../constants';
import { Attachment } from '../types';

// Robust Worker Initialization using CDNJS (Stable)
// We match the version in package.json (3.11.174)
const PDFJS_VERSION = '3.11.174';
const WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

try {
  // @ts-ignore
  if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
  } else {
      // @ts-ignore
      if (pdfjsLib.default && pdfjsLib.default.GlobalWorkerOptions) {
          // @ts-ignore
          pdfjsLib.default.GlobalWorkerOptions.workerSrc = WORKER_URL;
      }
  }
} catch (e) {
  console.warn("Failed to initialize PDF Worker:", e);
}

/**
 * Counts pages in a PDF file with a timeout to prevent hanging
 */
const countPdfPages = async (file: File): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    // 1. Timeout failsafe (3 seconds)
    const timer = setTimeout(() => {
        reject(new Error("PDF Read Timeout"));
    }, 3000);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Determine correct export for getDocument
      // @ts-ignore
      const getDoc = pdfjsLib.getDocument || pdfjsLib.default?.getDocument;
      
      if (!getDoc) {
          throw new Error("PDF.js library not loaded correctly");
      }

      const loadingTask = getDoc({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      clearTimeout(timer);
      resolve(pdf.numPages);
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
};

/**
 * Main Validation Logic Pipeline
 */
export const validateUpload = async (
  newFiles: File[], 
  currentAttachments: Attachment[]
): Promise<{ validFiles: File[]; errors: string[] }> => {
  
  const errors: string[] = [];
  const validFiles: File[] = [];

  // 1. Validate Total File Count
  if (currentAttachments.length + newFiles.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} documents allowed.`);
    return { validFiles: [], errors };
  }

  for (const file of newFiles) {
    // 2. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Unsupported format.`);
      continue;
    }

    // 3. Validate File Size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      errors.push(`${file.name}: Exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      continue;
    }

    // 4. Validate Page Count (PDF Only)
    // We implement a "Soft Fail" - if we can't read the PDF, we let it pass 
    // and let the backend/LLM decide if it can handle it.
    if (file.type === 'application/pdf') {
      try {
        const pageCount = await countPdfPages(file);
        if (pageCount > MAX_PAGES_PER_DOC) {
          errors.push(`${file.name}: Has ${pageCount} pages (Max ${MAX_PAGES_PER_DOC} allowed).`);
          continue;
        }
      } catch (e) {
        console.warn(`Could not validate PDF pages for ${file.name}. Allowing file to proceed.`, e);
        // Do NOT block the file. We push it to validFiles.
      }
    }

    // If all checks pass (or soft-failed)
    validFiles.push(file);
  }

  return { validFiles, errors };
};