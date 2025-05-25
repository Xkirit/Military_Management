import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError(''); // Clear API error when user makes changes
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setApiError('');
      
      try {
        const response = await authService.login(formData);
        const { token, user } = response.data;
        
        // Use AuthContext login method
        login(user, token);
        
        // Navigate to dashboard
        navigate('/dashboard');
        toast.success('Login successful');
      } catch (error) {
        
        // Handle specific error messages
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.response?.status === 401) {
          const serverMessage = error.response?.data?.message || '';
          if (serverMessage.includes('Incorrect password')) {
            errorMessage = 'Incorrect password. Please try again.';
          } else if (serverMessage.includes('No user found')) {
            errorMessage = 'Email not found. Please check your email address.';
          } else {
            errorMessage = 'Invalid email or password. Please try again.';
          }
        } else if (error.response?.status === 400) {
          const serverMessage = error.response?.data?.message || '';
          if (serverMessage.includes('email and password')) {
            errorMessage = 'Please provide both email and password.';
          } else {
            errorMessage = serverMessage || 'Invalid login credentials.';
          }
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Military Management System</h1>
        <h2>Login</h2>
        
        {apiError && (
          <div className="error-alert">
            <strong>⚠️ Error:</strong> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 