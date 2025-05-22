import React from 'react';

function NewChatForm({ 
  newChatName, 
  activeAgent, 
  agents, 
  setNewChatName, 
  setActiveAgent, 
  createNewChat, 
  cancelCreation 
}) {
  return (
    <div className="new-chat-form">
      <input
        type="text"
        placeholder="Enter chat name"
        value={newChatName}
        onChange={(e) => setNewChatName(e.target.value)}
      />
      <div className="agent-selector">
        <label>Select Agent:</label>
        <select 
          value={activeAgent}
          onChange={(e) => setActiveAgent(e.target.value)}
        >
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-buttons">
        <button onClick={createNewChat}>Create</button>
        <button onClick={cancelCreation}>Cancel</button>
      </div>
    </div>
  );
}

export default NewChatForm;