import React, { useEffect, useRef } from 'react';
import Message from './Message';

function MessageList({ messages, isLoading, chatContainerRef, currentAgent, activeChatId }) {
  // Keep track of user scrolling state
  const userScrolledRef = useRef(false);
  const prevMessagesLengthRef = useRef(messages.length);
  
  // Handle auto-scrolling behavior
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    const container = chatContainerRef.current;
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100;
    const hasNewMessage = messages.length > prevMessagesLengthRef.current;
    
    prevMessagesLengthRef.current = messages.length;
    
    // Auto-scroll if:
    // 1. User is already at the bottom
    // 2. New message was added and it's from the user (auto-scroll after sending)
    // 3. The initial messages are loaded
    // 4. Loading state changes to false (generation completed)
    if (
      isScrolledToBottom || 
      (hasNewMessage && messages[messages.length - 1]?.role === 'user') || 
      messages.length === 1 ||
      !userScrolledRef.current
    ) {
      setTimeout(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
          // Only reset userScrolled when we intentionally scroll
          if (hasNewMessage && messages[messages.length - 1]?.role === 'assistant') {
            userScrolledRef.current = false;
          }
        }
      }, 50);
    }
  }, [messages, isLoading, chatContainerRef]);
  
  // Detect manual scrolling by user
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const isScrolledToBottom = 
        container.scrollHeight - container.clientHeight <= container.scrollTop + 100;
      
      // If user scrolls up, mark as user scrolled
      if (!isScrolledToBottom) {
        userScrolledRef.current = true;
      }
      
      // If user scrolls to bottom, reset user scrolled
      if (isScrolledToBottom) {
        userScrolledRef.current = false;
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [chatContainerRef]);
  
  // Add a scroll-to-bottom button
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      userScrolledRef.current = false;
    }
  };

  return (
    <div className="chat-messages-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {!activeChatId ? (
          <div className="welcome-message">
            <p>Please select a chat from the sidebar or create a new one to start.</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="welcome-message">
            <p>Welcome! Send a message to start chatting with Qwen 2.5.</p>
            {currentAgent && (
              <div className="agent-description">
                <p><strong>{currentAgent.name}</strong></p>
                <p>{currentAgent.description}</p>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))
        )}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-bubble loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {userScrolledRef.current && messages.length > 0 && (
        <button 
          className="scroll-to-bottom-button"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          ↓
        </button>
      )}
    </div>
  );
}

export default MessageList;