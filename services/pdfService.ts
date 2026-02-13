
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';
import { BookletAnalysis, PageMapping } from '../types';

/**
 * Analyzes the booklet structure based on the user's specific scanning pattern:
 * Scanned order: P8, P1, P7, P2, P6, P3, P5, P4
 * Result order should be: P1, P2, P3, P4, P5, P6, P7, P8
 */
export const analyzeBooklet = (pageCount: number): BookletAnalysis => {
  if (pageCount === 0) {
    return { totalPages: 0, isValid: false, mappings: [], error: "No pages found." };
  }

  if (pageCount % 4 !== 0) {
    return {
      totalPages: pageCount,
      isValid: false,
      mappings: [],
      error: `A standard booklet requires a page count divisible by 4. You have ${pageCount} pages.`
    };
  }

  const mappings: PageMapping[] = [];
  const N = pageCount;

  // Pattern reconstruction based on: 8, 1, 7, 2, 6, 3, 5, 4
  // For each target page P (1-indexed):
  // If 1 <= P <= N/2: It is at original index 2*(P-1) + 1
  // If N/2 < P <= N: It is at original index 2*(N-P)

  for (let P = 1; P <= N; P++) {
    let originalIndex: number;
    if (P <= N / 2) {
      originalIndex = 2 * (P - 1) + 1;
    } else {
      originalIndex = 2 * (N - P);
    }
    
    mappings.push({
      originalIndex,
      targetPageNumber: P
    });
  }

  return {
    totalPages: N,
    isValid: true,
    mappings: mappings.sort((a, b) => a.targetPageNumber - b.targetPageNumber)
  };
};

export const reorderPdf = async (file: File): Promise<Uint8Array> => {
  const existingPdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pageCount = pdfDoc.getPageCount();
  
  const analysis = analyzeBooklet(pageCount);
  if (!analysis.isValid) {
    throw new Error(analysis.error || "Invalid booklet structure");
  }

  const newPdfDoc = await PDFDocument.create();
  
  // The mappings are sorted by targetPageNumber (1, 2, 3...)
  // So we just iterate through and pick the page from original index
  for (const mapping of analysis.mappings) {
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [mapping.originalIndex]);
    newPdfDoc.addPage(copiedPage);
  }

  return await newPdfDoc.save();
};
