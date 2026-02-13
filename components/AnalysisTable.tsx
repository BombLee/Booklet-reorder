
import React from 'react';
import { BookletAnalysis } from '../types';

interface AnalysisTableProps {
  analysis: BookletAnalysis;
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({ analysis }) => {
  if (!analysis.isValid) {
    return (
      <div className="bg-[#FFF2F2] border border-[#FFD2D2] text-[#D70015] px-5 py-4 rounded-2xl flex items-start gap-4">
        <i className="fa-solid fa-triangle-exclamation mt-1"></i>
        <div>
          <p className="font-bold">Invalid Booklet Structure</p>
          <p className="text-[15px] opacity-90">{analysis.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border border-[#F2F2F7] rounded-2xl shadow-sm">
      <table className="min-w-full divide-y divide-[#F2F2F7]">
        <thead className="bg-[#FBFBFD]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-[0.05em]">
              Scan Index
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[#86868B] uppercase tracking-[0.05em]">
              Correct Position
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-[#86868B] uppercase tracking-[0.05em]">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#F2F2F7]">
          {analysis.mappings.map((mapping) => (
            <tr key={mapping.targetPageNumber} className="hover:bg-[#F5F5F7] transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-[15px] font-medium text-[#1D1D1F]">
                #{mapping.originalIndex + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-[15px] text-[#007AFF] font-medium">
                Page {mapping.targetPageNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#E1F2E8] text-[#1EAD5D] rounded-full text-[10px]">
                  <i className="fa-solid fa-check"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
