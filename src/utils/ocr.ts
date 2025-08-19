/**
 * OCR utilities using Tesseract.js
 */

import { createWorker } from 'tesseract.js';

let worker: any = null;

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
}

export async function initializeOCR(): Promise<void> {
  if (worker) return;
  
  console.log('🤖 Initializing OCR...');
  
  try {
    worker = await createWorker('eng');
    
    await worker.setParameters({
      tessedit_pageseg_mode: '6', // Uniform block of text
      tessedit_char_whitelist: '0123456789.,$ '
    });
    
    console.log('✅ OCR initialized');
  } catch (error) {
    console.error('❌ OCR initialization failed:', error);
    throw error;
  }
}

export async function processImage(canvas: HTMLCanvasElement): Promise<OCRResult> {
  if (!worker) {
    await initializeOCR();
  }
  
  try {
    const result = await worker.recognize(canvas);
    
    const words = [];
    
    // Extract word-level data
    if (result.data.words) {
      for (const word of result.data.words) {
        if (word.text && word.bbox) {
          words.push({
            text: word.text,
            bbox: word.bbox,
            confidence: word.confidence
          });
        }
      }
    }
    
    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      words: words
    };
    
  } catch (error) {
    console.error('❌ OCR processing failed:', error);
    return { text: '', confidence: 0, words: [] };
  }
}

export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
