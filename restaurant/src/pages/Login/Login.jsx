import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './login.css';
import { url } from '../../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Register form fields
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    city: '',
    restaurantCode: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${url}/api/restaurant/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('restaurant-auth', 'true');
        localStorage.setItem('restaurant-token', response.data.token);
        localStorage.setItem('restaurant-email', response.data.email);
        localStorage.setItem('restaurant-name', response.data.name);
        localStorage.setItem('restaurant-code', response.data.restaurantCode);
        
        toast.success('Login successful!');
        // Reload page to trigger App.jsx auth check
        window.location.href = '/dashboard';
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${url}/api/restaurant/register`, registerData);

      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        setIsRegister(false);
        setEmail(registerData.email);
        setRegisterData({
          name: '',
          email: '',
          password: '',
          phoneNumber: '',
          address: '',
          city: '',
          restaurantCode: ''
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🍳 FoodFast Kitchen</h1>
          <p>{isRegister ? 'Register Your Restaurant' : 'Restaurant Panel Login'}</p>
        </div>

        {!isRegister ? (
          // Login Form
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Kitchen'}
            </button>
            
            <div className="switch-form">
              <p>
                Don't have an account?{' '}
                <span onClick={() => setIsRegister(true)}>Register here</span>
              </p>
            </div>
          </form>
        ) : (
          // Register Form
          <form onSubmit={handleRegister} className="login-form register-form">
            <div className="form-row">
              <div className="form-group">
                <label>Restaurant Name *</label>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="e.g., FoodFast Kitchen"
                  required
                />
              </div>
              <div className="form-group">
                <label>Restaurant Code *</label>
                <input
                  type="text"
                  name="restaurantCode"
                  value={registerData.restaurantCode}
                  onChange={handleRegisterChange}
                  placeholder="Unique code (min 4 chars)"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="restaurant@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="Min 6 characters"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={registerData.phoneNumber}
                  onChange={handleRegisterChange}
                  placeholder="0123456789"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={registerData.city}
                  onChange={handleRegisterChange}
                  placeholder="Ho Chi Minh"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                placeholder="Full address"
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Registering...' : 'Register Restaurant'}
            </button>
            
            <div className="switch-form">
              <p>
                Already have an account?{' '}
                <span onClick={() => setIsRegister(false)}>Login here</span>
              </p>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p>🔒 Your data is secure with us</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
