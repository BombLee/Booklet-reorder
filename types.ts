
export interface PageMapping {
  originalIndex: number;
  targetPageNumber: number;
}

export interface BookletAnalysis {
  totalPages: number;
  isValid: boolean;
  mappings: PageMapping[];
  error?: string;
}

export interface ProcessedFile {
  name: string;
  size: number;
  totalPages: number;
  data: Uint8Array;
}

export interface FileItem {
  id: string;
  file: File;
  analysis: BookletAnalysis;
  isProcessing: boolean;
  processedData: Uint8Array | null;
  error?: string;
}
