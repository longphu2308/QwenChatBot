import React, { useState } from 'react';
import '../../styles/settings.css';

function Settings({ theme, toggleTheme, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('appearance');

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
        
        {activeTab === 'appearance' && (
          <div className="settings-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Theme</h3>
                <p>Choose between light and dark theme</p>
              </div>
              <div className="theme-toggle">
                <button 
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => toggleTheme('light')}
                >
                  Light
                </button>
                <button 
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => toggleTheme('dark')}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div className="settings-content">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Default Agent</h3>
                <p>Choose your default agent for new chats</p>
              </div>
              <select className="setting-select">
                <option value="general">General Assistant</option>
                <option value="coding">Code Helper</option>
                <option value="creative">Creative Writer</option>
              </select>
            </div>
          </div>
        )}
        
        {activeTab === 'about' && (
          <div className="settings-content">
            <div className="about-info">
              <h3>Qwen Chatbot</h3>
              <p>Version 1.0.0</p>
              <p>Powered by Qwen 2.5 AI Model</p>
              <p>© 2023 All Rights Reserved</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;