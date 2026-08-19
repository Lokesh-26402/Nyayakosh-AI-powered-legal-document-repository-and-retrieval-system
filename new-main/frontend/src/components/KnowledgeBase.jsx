import React, { useState } from 'react';
import { Folder, Upload, FileText, CheckCircle, RefreshCw } from 'lucide-react';

export default function KnowledgeBase({ files, setFiles }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(`Vectorizing "${file.name}" into storage framework...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('http://localhost:8000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Ingestion process failed");

      const data = await response.json();

      setFiles(prev => [
        { 
          name: file.name, 
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`, 
          status: "Indexed", 
          date: "Just Now" 
        },
        ...prev
      ]);
      setUploadMessage(`Successfully integrated! Processed ${data.processed_chunks || 0} chunks.`);
    } catch (error) {
      setUploadMessage("Failed to parse document. Check logs for format rules.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(""), 5000);
    }
  };

  return (
    <div className="flex flex-col h-full p-8 space-y-6 bg-[#0f172a] font-mono">
      <div className="border-b border-[#1e293b] pb-4">
        <h1 className="text-xl font-semibold flex items-center gap-2 text-slate-100">
          <Folder className="text-[#d97706]" size={22} /> Legal Knowledge Repository (RAG)
        </h1>
        <p className="text-xs text-slate-400 mt-1">Upload and vectorize raw reference acts into your secure offline AI instance.</p>
      </div>

      <div className="border border-[#334155] border-dashed bg-[#0b0f19]/60 rounded p-8 flex flex-col items-center justify-center text-center transition hover:border-[#d97706] relative">
        <Upload size={32} className="text-slate-500 mb-2" />
        <p className="text-sm text-slate-300 font-medium uppercase tracking-wide">Drag and drop your legal documents here</p>
        <p className="text-[10px] text-slate-500 mt-1 mb-4">SUPPORTS TXT, PDF, DOCX UP TO 25MB</p>
        
        <label className="bg-[#1e293b] hover:bg-[#334155] border border-[#475569] text-[#fbbf24] px-4 py-2 rounded text-xs font-bold cursor-pointer transition uppercase tracking-wider">
          Browse Local Files
          <input 
            type="file" 
            accept=".txt,.html,.csv,.pdf,.doc,.docx" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
        </label>

        {uploadMessage && (
          <div className="absolute bottom-3 flex items-center gap-2 text-[10px] uppercase font-bold text-slate-300 bg-[#0b0f19] px-4 py-1.5 rounded border border-[#334155]">
            {isUploading ? <RefreshCw size={12} className="animate-spin text-amber-500" /> : <CheckCircle size={12} className="text-emerald-400" />}
            {uploadMessage}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Indexed Collections</h3>
        <div className="bg-[#0b0f19]/40 border border-[#1e293b] rounded overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0b0f19] text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3 font-medium">Document Name</th>
                <th className="p-3 font-medium">File Size</th>
                <th className="p-3 font-medium">Ingestion Date</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {files.map((file, i) => (
                <tr key={i} className="hover:bg-[#1e293b]/40 text-slate-300 transition">
                  <td className="p-3 flex items-center gap-2 truncate max-w-xs font-sans font-bold">
                    <FileText size={14} className="text-[#fbbf24]" /> {file.name}
                  </td>
                  <td className="p-3 text-slate-400 font-mono">{file.size}</td>
                  <td className="p-3 text-slate-400 uppercase">{file.date}</td>
                  <td className="p-3">
                    <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                      {file.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}