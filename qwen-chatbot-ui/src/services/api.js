import axios from 'axios';

const API_URL = 'http://0.0.0.0:8000';

// Request interceptor to add token to requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Setup axios with auth interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is unauthorized and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Check if we should try to refresh or redirect to login
        const token = localStorage.getItem('token');
        if (!token) {
          return Promise.reject(error);
        }
        
        // Clear token since it's invalid
        localStorage.removeItem('token');
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('token');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    try {
      // IMPORTANT: OAuth2 expects username not email, and wants multipart/form-data
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Log successful response for debugging
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password
      });
      
      // Log successful registration
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getUserProfile: async () => {
    const response = await axios.get(`${API_URL}/users/me`);
    return response.data;
  }
};

// Chat services remain the same
export const chatService = {
  getChats: async () => {
    const response = await axios.get(`${API_URL}/chats`);
    return response.data;
  },
  
  getChat: async (chatId) => {
    const response = await axios.get(`${API_URL}/chats/${chatId}`);
    return response.data;
  },
  
  createChat: async (name, agentId) => {
    const response = await axios.post(`${API_URL}/chats`, {
      name,
      agent_id: agentId
    });
    return response.data;
  },
  
  updateChat: async (chatId, data) => {
    const response = await axios.put(`${API_URL}/chats/${chatId}`, data);
    return response.data;
  },
  
  deleteChat: async (chatId) => {
    const response = await axios.delete(`${API_URL}/chats/${chatId}`);
    return response.data;
  },
  
  sendMessage: async (message, agentId, model) => {
    const response = await axios.post(`${API_URL}/chat`, {
      message,
      agentId,
      model
    });
    return response.data;
  },
  
  searchWiki: async (query) => {
    const response = await axios.get(`${API_URL}/search/wiki?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};