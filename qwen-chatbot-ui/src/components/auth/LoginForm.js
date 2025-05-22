import React, { useState } from 'react';

function LoginForm({ handleLogin, authError, switchView, isLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await handleLogin(email, password);
    } finally {
      // Only set local loading to false if the parent isLoading is false
      // This helps prevent flicker if parent component is still loading
      if (!isLoading) {
        setLocalLoading(false);
      }
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {authError && <div className="auth-error">{authError}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || localLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || localLoading}
          />
        </div>
        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading || localLoading}
        >
          {isLoading || localLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-switch">
        Don't have an account?
        <button 
          onClick={switchView} 
          className="link-button"
          disabled={isLoading || localLoading}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default LoginForm;