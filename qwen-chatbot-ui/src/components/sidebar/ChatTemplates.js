import React from 'react';

function ChatTemplates({ templates, createNewChat, closeTemplates, showNewChatForm }) {
  return (
    <div className="templates-container">
      <h3>Start a new chat with a template</h3>
      <div className="templates-grid">
        {templates.map((template, index) => (
          <div 
            key={index} 
            className="template-card"
            onClick={() => createNewChat(template)}
          >
            <div className="template-icon">{template.icon}</div>
            <h4>{template.name}</h4>
            <p>{template.description}</p>
          </div>
        ))}
      </div>
      <div className="templates-footer">
        <button 
          onClick={showNewChatForm}
          className="custom-chat-button"
        >
          Create Custom Chat
        </button>
        <button 
          onClick={closeTemplates}
          className="cancel-button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ChatTemplates;