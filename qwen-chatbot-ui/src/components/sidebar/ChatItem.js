import React from 'react';

function ChatItem({ chat, isActive, onSelect, onRename, onDelete, renameChatId, handleRename }) {
  return (
    <div 
      className={`chat-item ${isActive ? 'active' : ''}`}
    >
      {renameChatId === chat.id ? (
        <div className="rename-form">
          <input
            type="text"
            defaultValue={chat.name}
            onBlur={(e) => handleRename(chat.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(chat.id, e.target.value);
            }}
            autoFocus
          />
        </div>
      ) : (
        <>
          <div 
            className="chat-name"
            onClick={() => onSelect(chat.id)}
          >
            {chat.name}
          </div>
          <div className="chat-actions">
            <button 
              onClick={() => onRename(chat.id)}
              className="icon-button"
            >
              ✏️
            </button>
            <button 
              onClick={() => onDelete(chat.id)}
              className="icon-button"
            >
              🗑️
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatItem;