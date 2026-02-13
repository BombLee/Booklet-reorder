
import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface FileUploaderProps {
  onFilesSelect: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fix: Explicitly type 'f' as 'File' to avoid 'unknown' type error on 'f.type' when using Array.from on FileList
      const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type === 'application/pdf');
      if (files.length > 0) {
        onFilesSelect(files);
      } else {
        alert("Please upload PDF files.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`relative group border-2 border-dashed rounded-[32px] p-12 text-center transition-all duration-300 ${
        isDragging ? 'border-[#007AFF] bg-[#007AFF]/5 scale-[1.01]' : 'border-[#D2D2D7] bg-white'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
          <i className="fa-solid fa-cloud-arrow-up text-[#007AFF] text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-[#1D1D1F] mb-2 tracking-tight">Drop your scans here</h3>
        <p className="text-[#86868B] mb-8 max-w-sm text-md leading-relaxed">
          Select one or multiple PDF files to reorder them in bulk.
        </p>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          multiple
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()} size="md">
          Select Files
        </Button>
      </div>
    </div>
  );
};
