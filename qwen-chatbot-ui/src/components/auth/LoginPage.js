import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../../styles/auth.css';

// Sample screenshots to showcase in the carousel
const screenshots = [
  {
    image: '/images/screenshot1.png',
    title: 'Advanced AI Chat Assistant',
    description: 'Intelligent conversations with Qwen 2.5 model'
  },
  {
    image: '/images/screenshot2.png',
    title: 'Research Enhanced Responses',
    description: 'Get more accurate answers with integrated search'
  },
  {
    image: '/images/screenshot3.png',
    title: 'Multiple AI Agents',
    description: 'Choose specialized assistants for different tasks'
  }
];

function LoginPage({ handleLogin, handleRegister, authError, authView, setAuthView, isLoading }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="login-page">
      <div className="auth-showcase">
        <div className="logo-section">
          <h1>Qwen Chatbot</h1>
          <p>Powered by Qwen 2.5 AI Model</p>
        </div>
        
        <div className="carousel-wrapper">
          <div className="carousel-container">
            {screenshots.map((slide, index) => (
              <div 
                key={index} 
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                  zIndex: index === currentSlide ? 2 : 1
                }}
              >
                <div className="screenshot-container">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="screenshot" 
                    onError={(e) => {
                      console.error(`Failed to load image: ${slide.image}`);
                      e.target.src = '/fallback-image.png';
                    }}
                  />
                  <div className="overlay"></div>
                </div>
                <div className="slide-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="carousel-dots">
          {screenshots.map((_, index) => (
            <button 
              key={index} 
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="auth-container">
        {authView === 'login' ? (
          <LoginForm 
            handleLogin={handleLogin} 
            authError={authError} 
            switchView={() => setAuthView('register')} 
            isLoading={isLoading}
          />
        ) : (
          <RegisterForm 
            handleRegister={handleRegister} 
            authError={authError} 
            switchView={() => setAuthView('login')}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default LoginPage;