import React from 'react';
import MessageList from './MessageList';
import ChatInputBox from './ChatInputBox';

function ChatInterface({
  isSidebarOpen,
  toggleSidebar,
  activeChat,
  currentAgent,
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  sendMessage,
  handleKeyPress,
  chatContainerRef,
  activeChatId,
  isSearchModeActive,
  toggleSearchMode,
  openSettings,
  theme
}) {
  return (
    <div className="chat-interface">
      <div className="toggle-sidebar">
        <button onClick={toggleSidebar}>
          {isSidebarOpen ? '◀' : '▶'}
        </button>
      </div>
      
      <div className="chat-header">
        <h1>{activeChat ? activeChat.name : 'Qwen 2.5 Chatbot'}</h1>
        <div className="header-actions">
          {currentAgent && (
            <div className="active-agent">
              Using: {currentAgent.name}
              {isSearchModeActive && <span className="search-indicator"> • Search Enhanced</span>}
            </div>
          )}
          <button 
            className="settings-button"
            onClick={openSettings}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        chatContainerRef={chatContainerRef}
        currentAgent={currentAgent}
        activeChatId={activeChatId}
      />
      
      <ChatInputBox 
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        sendMessage={sendMessage}
        handleKeyPress={handleKeyPress}
        isLoading={isLoading}
        activeChatId={activeChatId}
        isSearchModeActive={isSearchModeActive}
        toggleSearchMode={toggleSearchMode}
      />
    </div>
  );
}

export default ChatInterface;