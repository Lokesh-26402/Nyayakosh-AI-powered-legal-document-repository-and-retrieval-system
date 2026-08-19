import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import KnowledgeBase from './components/KnowledgeBase';

export default function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [activeChatId, setActiveChatId] = useState('default');
  const [chatHistory, setChatHistory] = useState([]);
  const [activePersona, setActivePersona] = useState('defense_system');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "Manual_for_Courts_Martial.pdf", size: "4.2 MB", status: "Classified / Indexed", date: "02 Jun 2026" }
  ]);

  const [chats, setChats] = useState({
    default: [] 
  });

  function updateActiveChatMessages(newMessages) {
    setChats(prev => ({
      ...prev,
      [activeChatId]: newMessages
    }));
  }

  const handleNewChat = () => {
    if (isLoading) return;
    const newId = 'briefing_' + Date.now();
    setChats(prev => ({ ...prev, [newId]: [] }));
    setActiveChatId(newId);
    setCurrentView('chat');
  };

  const createNewHistoryEntry = (firstMessageText) => {
    const cleanTitle = firstMessageText.length > 22 
      ? firstMessageText.substring(0, 20) + '...' 
      : firstMessageText;

    setChatHistory(prev => {
      if (prev.some(entry => entry.id === activeChatId)) return prev;
      return [{ id: activeChatId, title: `BRF // ${cleanTitle.toUpperCase()}` }, ...prev];
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-[#e2e8f0] font-mono overflow-hidden selection:bg-amber-900/40">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        chatHistory={chatHistory} 
        onNewChat={handleNewChat}
        activeChatId={activeChatId}
        isLoading={isLoading}
        onSelectChat={(id) => {
          if (isLoading) return;
          setActiveChatId(id);
          setCurrentView('chat');
        }}
      />
      <main className="flex-1 flex flex-col h-full bg-[#0f172a] relative">
        {currentView === 'chat' ? (
          <ChatInterface 
            key={activeChatId} 
            messages={chats[activeChatId] || []}
            setMessages={updateActiveChatMessages}
            onFirstMessage={createNewHistoryEntry} 
            activePersona={activePersona}
            setActivePersona={setActivePersona}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <KnowledgeBase files={uploadedFiles} setFiles={setUploadedFiles} />
        )}
      </main>
    </div>
  );
}