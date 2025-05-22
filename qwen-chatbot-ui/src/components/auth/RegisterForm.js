import React, { useState } from 'react';

function RegisterForm({ handleRegister, authError, switchView }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    handleRegister(formData.name, formData.email, formData.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Create New Account</h2>
        {authError && <div className="auth-error">{authError}</div>}
        <form onSubmit={submitForm}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          <button type="submit" className="auth-button">Register</button>
        </form>
        <p className="auth-switch">
          Already have an account? 
          <button onClick={() => switchView('login')} className="link-button">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;