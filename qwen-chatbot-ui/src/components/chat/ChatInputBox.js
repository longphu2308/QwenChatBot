import React from 'react';

function ChatInputBox({ 
  inputMessage, 
  setInputMessage, 
  sendMessage,
  handleKeyPress, 
  isLoading, 
  activeChatId,
  isSearchModeActive,
  toggleSearchMode
}) {
  // Fixed handleKeyPress to clear input properly
  const handleLocalKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) {
        const messageToSend = inputMessage; // Store current message
        setInputMessage(''); // Clear input immediately before sending
        // Use the stored message for sending
        sendMessage(messageToSend);
      }
    }
  };

  return (
    <div className="chat-input-container">
      <div className="input-actions">
        <button 
          className={`search-button ${isSearchModeActive ? 'active' : ''}`}
          onClick={() => toggleSearchMode()} // Ensure we're calling the function
          disabled={!activeChatId}
          title={isSearchModeActive ? "Disable search enhancement" : "Enable search enhancement"}
        >
          {isSearchModeActive ? "Search: ON" : "Search: OFF"}
        </button>
      </div>
      
      <div className="input-with-send">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleLocalKeyPress}
          placeholder={activeChatId ? 
            isSearchModeActive ? 
              "Ask a question with enhanced search..." : 
              "Type your message here..." 
            : "Select or create a chat to start"}
          className="chat-input"
          disabled={!activeChatId}
        />
        <button 
          onClick={() => {
            if (!isLoading && inputMessage.trim()) {
              const messageToSend = inputMessage;
              setInputMessage('');
              sendMessage(messageToSend);
            }
          }} 
          className="send-button" 
          disabled={isLoading || !activeChatId || !inputMessage.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatInputBox;