
import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { AnalysisTable } from './components/AnalysisTable';
import { Button } from './components/Button';
import { analyzeBooklet, reorderPdf } from './services/pdfService';
import { FileItem } from './types';
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

const App: React.FC = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const handleFilesSelect = async (selectedFiles: File[]) => {
    const newItems: FileItem[] = [];
    
    for (const file of selectedFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        const pageCount = pdfDoc.getPageCount();
        const analysis = analyzeBooklet(pageCount);
        
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          analysis,
          isProcessing: false,
          processedData: null
        });
      } catch (err) {
        console.error(`Failed to analyze ${file.name}:`, err);
      }
    }
    
    setItems(prev => [...prev, ...newItems]);
  };

  const processFile = async (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isProcessing: true } : item));
    
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;
      
      const data = await reorderPdf(item.file);
      setItems(prev => prev.map(item => item.id === id ? { ...item, isProcessing: false, processedData: data } : item));
    } catch (err: any) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, isProcessing: false, error: err.message || "Failed to process" } : item));
    }
  };

  const processAll = async () => {
    setIsBatchProcessing(true);
    for (const item of items) {
      if (!item.processedData && !item.error && item.analysis.isValid) {
        await processFile(item.id);
      }
    }
    setIsBatchProcessing(false);
  };

  const downloadFile = (item: FileItem) => {
    if (!item.processedData) return;
    const blob = new Blob([item.processedData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sequential_${item.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    items.forEach(item => {
      if (item.processedData) {
        downloadFile(item);
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleReset = () => {
    setItems([]);
  };

  const anyProcessed = items.some(i => i.processedData !== null);
  const anyToProcess = items.some(i => !i.processedData && i.analysis.isValid);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="apple-glass border-b border-[#D2D2D7]/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-[52px]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-[#1D1D1F] rounded-[7px] flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-book text-[12px]"></i>
              </div>
              <span className="text-[17px] font-bold text-[#1D1D1F] tracking-tight">Booklet Reorder Pro</span>
            </div>
            {items.length > 0 && (
              <button 
                onClick={handleReset}
                className="text-[#007AFF] text-[15px] font-medium hover:underline flex items-center gap-1"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 w-full py-12">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <div className="space-y-16">
              <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl md:text-6xl font-extrabold text-[#1D1D1F] tracking-tighter leading-tight">
                  Batch reorder booklets.
                </h1>
                <p className="text-xl text-[#86868B] max-w-2xl mx-auto font-medium leading-relaxed">
                  Drop multiple files to fix scanning orders instantly. Processed completely in your browser for total privacy.
                </p>
              </div>
              <FileUploader onFilesSelect={handleFilesSelect} />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#1D1D1F]">
                  Queue ({items.length})
                </h2>
                <div className="flex gap-3">
                  {anyToProcess && (
                    <Button variant="outline" size="sm" onClick={processAll} isLoading={isBatchProcessing}>
                      Process All
                    </Button>
                  )}
                  {anyProcessed && (
                    <Button variant="primary" size="sm" onClick={downloadAll}>
                      Download All
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'application/pdf';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) handleFilesSelect(Array.from(files));
                    };
                    input.click();
                  }}>
                    Add Files
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="apple-card overflow-hidden">
                    <div className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-file-pdf text-[#FF3B30] text-xl"></i>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1D1D1F] truncate text-md">{item.file.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-[#86868B] font-medium">
                          <span>{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{item.analysis.totalPages} Pages</span>
                          {item.processedData && (
                            <span className="text-[#1EAD5D] flex items-center gap-1">
                              <i className="fa-solid fa-circle-check"></i>
                              Ready
                            </span>
                          )}
                          {item.error && (
                            <span className="text-[#FF3B30] flex items-center gap-1">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              {item.error}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.processedData && !item.error && item.analysis.isValid && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => processFile(item.id)}
                            isLoading={item.isProcessing}
                          >
                            Process
                          </Button>
                        )}
                        {item.processedData && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => downloadFile(item)}
                          >
                            Download
                          </Button>
                        )}
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-[#86868B] hover:text-[#FF3B30] transition-colors"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    </div>
                    {!item.analysis.isValid && (
                      <div className="bg-[#FFF2F2] px-5 py-3 border-t border-[#FFD2D2] text-[#D70015] text-xs font-medium">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                        {item.analysis.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#D2D2D7]/30 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[#86868B] text-xs font-medium uppercase tracking-widest mb-2">
            Privacy First • Local Processing
          </p>
          <p className="text-[#D2D2D7] text-[10px]">
            Created for specialized booklet scanning workflows.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
