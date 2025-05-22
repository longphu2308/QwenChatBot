import React from 'react';
import ChatItem from './ChatItem';
import ChatTemplates from './ChatTemplates';
import NewChatForm from './NewChatForm';

function Sidebar({
  isOpen,
  chats,
  activeChatId,
  showTemplates,
  showNewChatForm,
  templates,
  agents,
  user,
  activeAgent,
  newChatName,
  renameChatId,
  setShowTemplates,
  setShowNewChatForm,
  setNewChatName,
  setActiveAgent,
  setRenameChatId,
  createNewChat,
  selectChat,
  renameChat,
  deleteChat,
  handleLogout
}) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button 
          className="new-chat-button"
          onClick={() => {
            setShowTemplates(true);
            setShowNewChatForm(false);
          }}
        >
          New Chat
        </button>
      </div>
      
      {showTemplates && (
        <ChatTemplates 
          templates={templates}
          createNewChat={createNewChat}
          closeTemplates={() => setShowTemplates(false)}
          showNewChatForm={() => {
            setShowTemplates(false);
            setShowNewChatForm(true);
          }}
        />
      )}
      
      {showNewChatForm && (
        <NewChatForm 
          newChatName={newChatName}
          activeAgent={activeAgent}
          agents={agents}
          setNewChatName={setNewChatName}
          setActiveAgent={setActiveAgent}
          createNewChat={() => createNewChat()}
          cancelCreation={() => setShowNewChatForm(false)}
        />
      )}
      
      <div className="chats-list">
        {chats.length === 0 ? (
          <div className="empty-chats">
            <p>No chats yet. Start a new conversation!</p>
          </div>
        ) : (
          chats.map(chat => (
            <ChatItem 
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={selectChat}
              onRename={setRenameChatId}
              onDelete={deleteChat}
              renameChatId={renameChatId}
              handleRename={renameChat}
            />
          ))
        )}
      </div>
      
      <div className="agent-list">
        <h3>Agents</h3>
        {agents.map(agent => (
          <div key={agent.id} className="agent-item">
            <div className="agent-info">
              <strong>{agent.name}</strong>
              <p>{agent.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="user-section">
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;