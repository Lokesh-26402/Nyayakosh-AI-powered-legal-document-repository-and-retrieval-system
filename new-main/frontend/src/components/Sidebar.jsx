import React from 'react';
import { Shield, Folder, Plus, Terminal } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, chatHistory, onNewChat, activeChatId, onSelectChat, isLoading }) {
  return (
    <div className="w-64 bg-[#0b0f19] h-full border-r border-[#1e293b] flex flex-col p-4 space-y-4 font-mono select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 border-b border-[#1e293b] pb-2">
        <span>MISSION LOGS</span>
        <button 
          onClick={onNewChat} 
          disabled={isLoading}
          className={`p-1 border border-[#334155] text-slate-300 rounded transition flex items-center gap-1 normal-case text-[10px] uppercase font-bold ${isLoading ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#1e293b] hover:text-[#fbbf24]'}`}
          title="Initialize New Log"
        >
          <Plus size={12} /> NEW LOG
        </button>
      </div>

      {/* History Actions List */}
      <div className="flex flex-col space-y-1 flex-1 overflow-y-auto">
        {chatHistory.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            disabled={isLoading}
            className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold uppercase flex items-center gap-2 truncate border transition ${
              activeChatId === chat.id && currentView === 'chat' 
                ? 'bg-[#1e293b] text-[#fbbf24] border-[#d97706]/40' 
                : 'text-slate-400 border-transparent hover:bg-[#1e293b]/40 hover:text-slate-200'
            } ${isLoading ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Terminal size={12} className="min-w-[12px] text-slate-500" />
            <span className="truncate tracking-wide">{chat.title}</span>
          </button>
        ))}
      </div>

      {/* Vault Base Anchors */}
      <div className="border-t border-[#1e293b] pt-2">
        <button 
          onClick={() => !isLoading && setCurrentView('knowledge')}
          disabled={isLoading}
          className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 border transition ${
            currentView === 'knowledge' ? 'bg-[#1e293b] text-[#fbbf24] border-[#d97706]/40' : 'text-slate-400 border-transparent hover:bg-[#1e293b]/50'
          } ${isLoading ? 'opacity-20 cursor-not-allowed' : ''}`}
        >
          <Folder size={12} className="text-[#d97706]" /> SECURE REPOSITORY
        </button>
      </div>
    </div>
  );
}