import React, { useState, useRef, useEffect, useCallback } from 'react';
import { authService, chatService } from './services/api';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/sidebar/Sidebar';
import ChatInterface from './components/chat/ChatInterface';
import Settings from './components/settings/Settings';
import './styles/main.css';

function App() {
  // Chat state
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Session and chats state
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Agent state
  const agents = [
    { id: 'general', name: 'General Assistant', description: 'General purpose AI assistant', model: 'qwen2.5' },
    { id: 'coding', name: 'Code Helper', description: 'Specialized in coding assistance', model: 'qwen2.5' },
    { id: 'creative', name: 'Creative Writer', description: 'For creative writing and ideas', model: 'qwen2.5' }
  ];
  const [activeAgent, setActiveAgent] = useState('general');
  
  // UI state
  const [newChatName, setNewChatName] = useState('');
  const [renameChatId, setRenameChatId] = useState(null);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Add a new state for search mode
  const [isSearchModeActive, setIsSearchModeActive] = useState(false);

  // Theme state
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Handle API auth errors - MOVED UP before being used
  const handleApiAuthError = useCallback((error) => {
    if (error.response?.status === 401) {
      console.log('Authentication error, logging out');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
      setAuthError('Your session has expired. Please login again.');
      setAuthView('login');
    }
    return error;
  }, []);
  
  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load theme preference on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Authentication handlers
  const fetchUserProfile = async () => {
    try {
      const userData = await authService.getUserProfile();
      setUser(userData);
      setIsAuthenticated(true);
      await loadChats();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear auth state
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setAuthError('Session expired. Please login again.');
      setAuthView('login');
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setAuthError('');
      setIsAuthLoading(true);
      
      console.log(`Attempting to login with email: ${email}`);
      const data = await authService.login(email, password);
      
      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
        await fetchUserProfile();
      } else {
        setAuthError('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Login failed. Please check your credentials.';
      
      if (error.response?.status === 401) {
        errorMsg = 'Invalid email or password.';
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      
      setAuthError(errorMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      setAuthError('');
      setIsAuthLoading(true);
      
      console.log(`Attempting to register with email: ${email}`);
      const registerResponse = await authService.register(name, email, password);
      
      if (registerResponse) {
        console.log('Registration successful, waiting before login attempt...');
        
        // Wait a bit longer to ensure the server has processed the registration
        setTimeout(async () => {
          try {
            console.log('Attempting auto-login after registration');
            await handleLogin(email, password);
          } catch (loginError) {
            console.error('Auto-login after registration failed:', loginError);
            setAuthError('Registration successful, but auto-login failed. Please try logging in manually.');
            setAuthView('login');
            setIsAuthLoading(false);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setIsAuthLoading(false);
      
      // Better error handling
      if (error.response?.status === 400 && error.response?.data?.detail) {
        setAuthError(error.response.data.detail);
      } else if (error.response?.status === 500 && error.response?.data?.detail) {
        setAuthError(`Server error: ${error.response.data.detail}`);
      } else {
        setAuthError('Registration failed. Please try again later.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setChats([]);
    setMessages([]);
    setActiveChatId(null);
  };

  // Chat management functions
  const loadChats = async () => {
    try {
      const chatsData = await chatService.getChats();
      setChats(chatsData || []);
      
      if (chatsData && chatsData.length > 0) {
        selectChat(chatsData[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const saveMessagesToChat = useCallback(async (newMessages) => {
    if (!activeChatId) return;
    
    try {
      await chatService.updateChat(activeChatId, { messages: newMessages })
        .catch(handleApiAuthError);
      
      const updatedChats = chats.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: newMessages } 
          : chat
      );
      setChats(updatedChats);
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [activeChatId, chats, handleApiAuthError]);

  const createNewChat = async (template = null) => {
    try {
      let chatName = newChatName;
      let selectedAgent = activeAgent;
      
      // If using a template
      if (template) {
        chatName = template.name;
        selectedAgent = template.agentId;
      }
      
      if (!chatName) {
        chatName = `New Chat ${chats.length + 1}`;
      }
      
      const newChat = await chatService.createChat(chatName, selectedAgent)
        .catch(handleApiAuthError);
      
      if (!newChat) return; // If null, auth error was handled
      
      setChats([...chats, newChat]);
      setActiveChatId(newChat.id);
      setMessages([]);
      setActiveAgent(newChat.agent_id);
      setShowNewChatForm(false);
      setShowTemplates(false);
      setNewChatName('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const selectChat = async (chatId) => {
    try {
      const chat = await chatService.getChat(chatId)
        .catch(handleApiAuthError);
      
      if (!chat) return; // If null, auth error was handled
      
      setActiveChatId(chatId);
      setMessages(chat.messages || []);
      setActiveAgent(chat.agent_id);
    } catch (error) {
      console.error('Error selecting chat:', error);
    }
  };

  const renameChat = async (chatId, newName) => {
    try {
      await chatService.updateChat(chatId, { name: newName });
      const updatedChats = chats.map(chat => 
        chat.id === chatId ? { ...chat, name: newName } : chat
      );
      setChats(updatedChats);
      setRenameChatId(null);
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      if (activeChatId === chatId) {
        if (updatedChats.length > 0) {
          selectChat(updatedChats[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Fix the useEffect dependency warning and remove auto-scrolling from here
  useEffect(() => {
    // REMOVE the auto-scrolling code here since we moved it to MessageList
    // Only keep the save messages functionality
    if (activeChatId && messages.length > 0) {
      saveMessagesToChat(messages);
    }
  }, [messages, activeChatId, saveMessagesToChat]);

  // Add a toggle function
  const toggleSearchMode = () => {
    console.log("Toggle search mode from:", isSearchModeActive, "to:", !isSearchModeActive);
    setIsSearchModeActive(prevState => !prevState);
  };

  // Toggle theme function
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Modified sendMessage function to use handleApiAuthError
  const sendMessage = async (messageToSend = inputMessage) => {
    if (!messageToSend.trim() || !activeChatId) return;
    
    // Store the original question
    const originalQuestion = messageToSend;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: originalQuestion };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setInputMessage(''); // Make sure input is cleared
    
    try {
      // Get the active agent's model
      const currentAgent = agents.find(a => a.id === activeAgent);
      const model = currentAgent ? currentAgent.model : 'qwen2.5';
      
      // If search mode is active, use Wikipedia information first, but don't show this to the user
      if (isSearchModeActive) {
        // Get Wikipedia information silently
        const wikiResponse = await chatService.searchWiki(originalQuestion)
          .catch(handleApiAuthError);
        
        if (!wikiResponse) return; // If null, auth error was handled
        
        // Create an enhanced prompt that includes the wiki information
        const enhancedPrompt = `
Câu hỏi: ${originalQuestion}

Đây là một vài thông tin mà bạn có thể sử dụng cho câu trả lời của bạn:
${wikiResponse.content}

Làm ơn cho một câu trả lời đầy đủ và chính xác với câu hỏi dựa trên thông tin đó.
`;
        
        // Send the enhanced prompt to the AI
        const aiResponse = await chatService.sendMessage(enhancedPrompt, activeAgent, model)
          .catch(handleApiAuthError);
        
        if (!aiResponse) return; // If null, auth error was handled
        
        // Add only the AI's response to the chat history
        const aiMessage = { role: 'assistant', content: aiResponse.response };
        setMessages([...updatedMessages, aiMessage]);
      } else {
        // Regular chat message without Wikipedia
        const response = await chatService.sendMessage(originalQuestion, activeAgent, model)
          .catch(handleApiAuthError);
        
        if (!response) return; // If null, auth error was handled
        
        // Add AI response to chat
        const aiMessage = { role: 'assistant', content: response.response };
        setMessages([...updatedMessages, aiMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.' 
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleKeyPress to support Enter key properly
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) {
        sendMessage();
      }
    }
  };

  // Predefined chat templates
  const chatTemplates = [
    {
      name: "General Assistant",
      agentId: "general",
      description: "For general questions and conversations",
      icon: "💬"
    },
    {
      name: "Code Helper",
      agentId: "coding",
      description: "Help with programming and development",
      icon: "💻"
    },
    {
      name: "Creative Writing",
      agentId: "creative",
      description: "For stories, poetry, and creative content",
      icon: "✏️"
    },
    {
      name: "Research Assistant",
      agentId: "general",
      description: "Help with research and information gathering",
      icon: "🔍"
    }
  ];

  const activeChat = chats.find(chat => chat.id === activeChatId);
  const currentAgent = agents.find(agent => agent.id === activeAgent);

  // Main render
  return (
    <div className={`app-container ${theme}`}>
      {!isAuthenticated ? (
        <LoginPage
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          authError={authError}
          authView={authView}
          setAuthView={setAuthView}
          isLoading={isAuthLoading}
        />
      ) : (
        <div className="main-interface">
          <Sidebar 
            isOpen={isSidebarOpen}
            chats={chats}
            activeChatId={activeChatId}
            showTemplates={showTemplates}
            showNewChatForm={showNewChatForm}
            templates={chatTemplates}
            agents={agents}
            user={user}
            activeAgent={activeAgent}
            newChatName={newChatName}
            renameChatId={renameChatId}
            setShowTemplates={setShowTemplates}
            setShowNewChatForm={setShowNewChatForm}
            setNewChatName={setNewChatName}
            setActiveAgent={setActiveAgent}
            setRenameChatId={setRenameChatId}
            createNewChat={createNewChat}
            selectChat={selectChat}
            renameChat={renameChat}
            deleteChat={deleteChat}
            handleLogout={handleLogout}
          />
          
          <ChatInterface 
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            activeChat={activeChat}
            currentAgent={currentAgent}
            messages={messages}
            isLoading={isLoading}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
            handleKeyPress={handleKeyPress}
            chatContainerRef={chatContainerRef}
            activeChatId={activeChatId}
            isSearchModeActive={isSearchModeActive}
            toggleSearchMode={toggleSearchMode}
            openSettings={() => setIsSettingsOpen(true)}
            theme={theme}
          />
          
          <Settings 
            theme={theme}
            toggleTheme={toggleTheme}
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;