import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './login.css';

const Login = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple password check for restaurant
    if (password === 'RESTAURANT2024') {
      localStorage.setItem('restaurant-auth', 'true');
      toast.success('Login successful!');
      navigate('/dashboard');
      window.location.reload();
    } else {
      toast.error('Invalid password!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🍳 FoodFast Kitchen</h1>
          <p>Restaurant Panel Login</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Restaurant Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login to Kitchen
          </button>
        </form>
        <div className="login-footer">
          <p>Default password: RESTAURANT2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
