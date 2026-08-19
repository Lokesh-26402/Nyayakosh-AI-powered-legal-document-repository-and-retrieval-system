import React, { useState, useRef, useEffect } from 'react';
import { Send, Shield, ShieldAlert, Square, Clock, Paperclip, X, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ messages, setMessages, onFirstMessage, activePersona = 'defense_system', isLoading, setIsLoading }) {
  const [input, setInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [copiedIndex, setCopiedIndex] = useState(null); 
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null); 
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActivePreviewFile(null);
      }
    };

    if (activePreviewFile) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [activePreviewFile]);

  const handleStopResponding = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newFiles = files.map((file) => ({
      name: file.name,
      type: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : ''),
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      previewUrl: URL.createObjectURL(file),
      rawFile: file
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveUploadedFile = (idx) => {
    setUploadedFiles((prev) => {
      const copy = [...prev];
      const removed = copy[idx];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      copy.splice(idx, 1);
      return copy;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyText = async (text, idx) => {
    if (!text) return;
    
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
        return;
      } catch (err) {
        console.warn("Modern clipboard API restriction hit. Using textarea fallback...", err);
      }
    }

    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (err) {
      console.error("Clipboard context error: ", err);
    }
  };

const submitMessage = async (overrideText = null) => {
    const messageText = overrideText !== null ? overrideText : input.trim();
    if ((!messageText && uploadedFiles.length === 0) || isLoading) return;

    const userMsg = messageText;
    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let attachmentMeta = [];
    if (uploadedFiles.length > 0) {
      attachmentMeta = uploadedFiles.map((f) => ({ name: f.name, type: f.type, previewUrl: f.previewUrl }));
    }

    if (messages.length === 0 && onFirstMessage) {
      onFirstMessage(userMsg || uploadedFiles[0]?.name);
    }

    const userPayloadMessage = {
      role: 'user',
      content: userMsg || `Analyzing document: ${uploadedFiles[0]?.name}`,
      time: currentTimestamp,
      attachments: attachmentMeta
    };

    const withUserMessage = [...messages, userPayloadMessage];
    setMessages(withUserMessage);
    setIsLoading(true);
    setInput("");

    const filesToUpload = uploadedFiles.map((f) => f.rawFile).filter(Boolean);
    setUploadedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const withAssistantPlaceholder = [...withUserMessage, { role: 'assistant', content: "", time: currentTimestamp }];
    setMessages(withAssistantPlaceholder);

    let activeConversationTimeline = [...withAssistantPlaceholder];

    try {
      const formData = new FormData();
      formData.append("prompt", userMsg);
      formData.append("persona", activePersona);
      formData.append("history", JSON.stringify(withUserMessage.map(msg => ({ role: msg.role, content: msg.content }))));

      // Append file if it exists to the streaming payload
      if (filesToUpload.length > 0) {
        formData.append('file', filesToUpload[0]);
      }

      // Stream directly from our single unified logic point
      const response = await fetch('http://127.0.0.1:8000/api/chat/stream', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Pipeline connection lost.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const token = parsed.message?.content || "";

            if (token) {
              const lastIdx = activeConversationTimeline.length - 1;
              activeConversationTimeline[lastIdx] = {
                ...activeConversationTimeline[lastIdx],
                content: activeConversationTimeline[lastIdx].content + token
              };
              setMessages([...activeConversationTimeline]);
            }
          } catch (e) { }
        }
      }
    } catch (error) {
      const lastIdx = activeConversationTimeline.length - 1;
      activeConversationTimeline[lastIdx] = {
        ...activeConversationTimeline[lastIdx],
        content: `❌ **CRITICAL PIPELINE ERROR:** ${error.message}`
      };
      setMessages([...activeConversationTimeline]);
    } finally {
      setIsLoading(false);
    }
  };
/*****/
  const handleSendMessage = async (e) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleQuickAction = async (commandString) => {
    setInput(commandString);
    await submitMessage(commandString);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] font-mono">
      {/* Secure Header Section */}
      <div className="h-14 border-b border-[#1e293b] flex items-center px-6 justify-between bg-[#0b0f19] z-10">
        <div className="flex items-center gap-2 tracking-wider">
          <Shield size={18} className="text-[#d97706]" />
          <span className="text-xs font-bold text-slate-200">NYAYAKOSH // DEFENSE LEGAL ADVISORY & REPOSITORY SYSTEM</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-[#1e293b]/60 px-3 py-1 rounded border border-[#334155] text-emerald-400 font-bold uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 anonymity animate-ping"></span>
          SECURE COMMS // LIVE COGNITIVE CORPS PIPELINE
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none max-w-sm mx-auto mt-24 border border-dashed border-[#334155] p-8 rounded bg-[#0b0f19]/20">
            <ShieldAlert size={36} className="mb-3 text-[#d97706]" />
            <h2 className="text-xs font-bold text-slate-200 tracking-widest uppercase">Awaiting Operational Input</h2>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Provide legal briefs, manual mappings, or military case documentation for hyper-targeted repository parsing.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex max-w-3xl mx-auto gap-4 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role !== 'user' && (
                <div className="h-7 w-7 min-w-[28px] rounded bg-[#1e293b] border border-[#334155] flex items-center justify-center text-[10px] font-bold text-[#fbbf24]">SYS</div>
              )}
              <div className="flex flex-col space-y-1 max-w-[85%] group relative">
                <div className={`rounded px-4 py-2.5 text-xs leading-relaxed overflow-x-auto ${msg.role === 'user' ? 'bg-[#1e293b] border border-[#334155] text-slate-100' : 'bg-transparent text-slate-200'}`}>
                  
                  {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2 max-w-xl">
                      {msg.attachments.map((attachment, attachIdx) => (
                        <div key={attachIdx} className="p-2 rounded bg-[#0b0f19] border border-[#334155] min-w-[180px] max-w-sm flex-1">
                          {attachment.type?.startsWith('image/') ? (
                            <div className="flex flex-col gap-1.5">
                              <img
                                src={attachment.previewUrl}
                                alt="Intelligence Asset"
                                onClick={() => setActivePreviewFile({ url: attachment.previewUrl, name: attachment.name, type: attachment.type })}
                                className="max-h-32 w-full object-contain rounded border border-[#475569] bg-black/30 cursor-pointer transition duration-150 hover:border-[#fbbf24] hover:brightness-110"
                              />
                              <div className="text-[9px] text-slate-400 truncate px-1 max-w-[160px]">{attachment.name}</div>
                            </div>
                          ) : (
                            <div
                              className="flex items-center gap-3 p-1.5 cursor-pointer hover:bg-[#071025] transition rounded"
                              onClick={() => setActivePreviewFile({ url: attachment.previewUrl, name: attachment.name, type: attachment.type })}
                            >
                              <div className={`p-2 rounded border ${attachment.type === 'application/pdf' ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-blue-950/30 border-blue-900/50 text-blue-400'}`}>
                                <FileText size={18} />
                              </div>
                              <div className="text-[10px] text-slate-300 truncate flex-1 min-w-0">
                                <span className="block text-slate-500 uppercase text-[8px] font-bold tracking-wider">
                                  {attachment.type === 'application/pdf' ? 'PDF Log:' : 'DOCX Log:'}
                                </span>
                                <span className="truncate block font-mono text-slate-200 max-w-[120px]">{attachment.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.content === "" && isLoading && idx === messages.length - 1 ? (
                    <span className="flex items-center gap-1 py-1">
                      <span className="h-1.5 w-1.5 bg-[#fbbf24] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-[#fbbf24] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-[#fbbf24] rounded-full animate-bounce"></span>
                    </span>
                  ) : (
                    <div className="prose prose-invert max-w-none text-xs space-y-2 prose-table:border prose-table:border-[#334155] prose-th:bg-[#1e293b] prose-th:text-[#fbbf24] prose-th:p-2 prose-td:p-2 prose-td:border-t prose-td:border-[#1e293b] prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Subtext Metadata Block */}
                <div className={`text-[9px] text-slate-500 font-bold flex items-center gap-3 uppercase ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="flex items-center gap-1"><Clock size={9} /> {msg.time || "00:00"} // STAMP</span>
                  
                  {msg.content && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.content, idx)}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 text-slate-400 hover:text-[#fbbf24] transition duration-150 ease-in-out cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={10} className="text-emerald-400" />
                          <span className="text-emerald-400 font-bold">[COPIED]</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>[COPY]</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="h-7 w-7 min-w-[28px] rounded bg-[#334155] border border-[#475569] flex items-center justify-center text-[10px] font-bold text-white">OP</div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {activePreviewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setActivePreviewFile(null)}
        >
          <div
            className="flex flex-col gap-3 w-full max-w-5xl h-[90vh] bg-slate-950 border border-slate-800 rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="text-xs font-mono text-slate-400 truncate max-w-[70%]">{activePreviewFile.name}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const textToCopy = activePreviewFile.parsedText || activePreviewFile.extractedText || '';
                    if (!textToCopy) return;
                    try {
                      await navigator.clipboard.writeText(textToCopy);
                      setCopyStatus('copied');
                      setTimeout(() => setCopyStatus(null), 2000);
                    } catch (e) {}
                  }}
                  disabled={!(activePreviewFile.parsedText || activePreviewFile.extractedText)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 rounded transition-all text-xs font-mono"
                >
                  📋 COPY TEXT{copyStatus === 'copied' ? ' ✓ COPIED' : ''}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePreviewFile(null)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-900 rounded transition-all text-xs font-mono"
                >
                  ✕ CLOSE // ESC
                </button>
              </div>
            </div>

            <div className="w-full flex-1 overflow-auto flex items-center justify-center max-h-[78vh]">
              {activePreviewFile.type && activePreviewFile.type.startsWith('image/') ? (
                <img
                  src={activePreviewFile.url}
                  alt={activePreviewFile.name || 'preview'}
                  className="max-w-full max-h-[78vh] object-contain rounded border border-slate-800 bg-black/40 shadow-lg"
                />
              ) : activePreviewFile.type === 'application/pdf' || (activePreviewFile.name && activePreviewFile.name.toLowerCase().endsWith('.pdf')) ? (
                <iframe
                  src={activePreviewFile.url}
                  title={activePreviewFile.name}
                  className="w-full h-full rounded border border-slate-800"
                />
              ) : (
                <div className="w-full max-w-2xl p-8 rounded border border-slate-800 bg-[#071026]/60 flex flex-col items-center gap-6">
                  <div className="p-6 rounded bg-[#0b1220] border border-[#475569]">
                    <FileText size={48} className="text-slate-200" />
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-slate-200 text-sm mb-1">{activePreviewFile.name}</div>
                    <div className="text-[11px] text-slate-400">Document preview not available for this format.</div>
                  </div>
                  <a
                    href={activePreviewFile.url}
                    download={activePreviewFile.name}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#1e293b] border border-slate-800 text-xs font-mono text-[#fbbf24] hover:bg-[#334155] rounded"
                  >
                    📥 DOWNLOAD FOR EXTERNAL ANALYSIS
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Deck Section */}
      <div className="p-4 bg-[#0b0f19]/60 border-t border-[#1e293b] space-y-2">
        <div className="max-w-3xl mx-auto">
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex gap-2">
              {uploadedFiles[0].type && uploadedFiles[0].type.startsWith('image/') ? (
                <>
                  <button type="button" onClick={() => handleQuickAction('📝 Transcribe Image Text')} className="px-3 py-1 text-xs font-mono bg-[#0b1220] border border-[#334155] text-slate-200 rounded">📝 Transcribe Image Text</button>
                  <button type="button" onClick={() => handleQuickAction('🔍 Analyze Form Layout')} className="px-3 py-1 text-xs font-mono bg-[#0b1220] border border-[#334155] text-slate-200 rounded">🔍 Analyze Form Layout</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => handleQuickAction('📋 Executive Summary')} className="px-3 py-1 text-xs font-mono bg-[#0b1220] border border-[#334155] text-slate-200 rounded">📋 Executive Summary</button>
                  <button type="button" onClick={() => handleQuickAction('⚠️ Identify Legal Risks')} className="px-3 py-1 text-xs font-mono bg-[#0b1220] border border-[#334155] text-slate-200 rounded">⚠️ Identify Legal Risks</button>
                </>
              )}
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex gap-2 flex-wrap">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="p-2 bg-[#1e293b] border border-[#d97706]/40 rounded flex items-center gap-2 max-w-xs">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePreviewFile({ url: f.previewUrl, name: f.name, type: f.type })}>
                    {f.type && f.type.startsWith('image/') ? (
                      <img src={f.previewUrl} alt={f.name} className="h-8 w-8 object-cover rounded border border-[#334155]" />
                    ) : (
                      <div className={`p-1.5 rounded border ${f.type === 'application/pdf' ? 'bg-red-950/50 border-red-900/60 text-red-400' : 'bg-blue-950/50 border-blue-900/60 text-blue-400'}`}>
                        <FileText size={14} />
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] truncate flex-1">
                    <p className="text-slate-200 truncate font-sans font-bold max-w-[160px]">{f.name}</p>
                    <p className="text-slate-500 text-[8px] font-mono">{f.size}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveUploadedFile(i)} className="p-1 text-slate-400 hover:text-red-400 transition">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files || []);
              if (!files.length) return;
              const newFiles = files.map((file) => ({
                name: file.name,
                type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : ''),
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                previewUrl: URL.createObjectURL(file),
                rawFile: file
              }));
              setUploadedFiles((prev) => [...prev, ...newFiles]);
            }}
            className={`relative flex items-center bg-[#0b0f19] rounded border focus-within:border-[#d97706] transition pl-12 pr-10 py-2.5 ${isDragging ? 'border-2 border-dashed border-emerald-500/40 bg-[rgba(16,185,129,0.03)]' : 'border border-[#334155]'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={() => !isLoading && fileInputRef.current?.click()}
              className={`absolute left-3 p-1.5 rounded border border-transparent transition ${isLoading ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-[#fbbf24] hover:bg-[#1e293b]'}`}
              disabled={isLoading}
            >
              <Paperclip size={14} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "PARSING SECURE REPOSITORY DATA..." : "ENTER LEGAL INTERROGATORY OR ATTACH MILITARY BRIEFING..."}
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-600 uppercase tracking-wide"
              disabled={isLoading}
            />
            
            {isLoading ? (
              <button 
                type="button" 
                onClick={handleStopResponding}
                className="absolute right-3 p-1.5 rounded bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900/50 transition flex items-center justify-center"
              >
                <Square size={11} fill="currentColor" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={!input.trim() && uploadedFiles.length === 0} 
                className={`absolute right-3 p-1.5 rounded transition ${(input.trim() || uploadedFiles.length) ? 'bg-[#1e293b] text-[#fbbf24] border border-[#334155] hover:bg-[#334155]' : 'text-slate-700'}`}
              >
                <Send size={12} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}