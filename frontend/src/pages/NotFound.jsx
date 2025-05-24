import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    backgroundColor: '#f5f5f5'
  };

  const contentStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center'
  };

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    margin: '0.5rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#1a237e',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#1a237e',
    border: '1px solid #1a237e'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</div>
        <h1 style={{ color: '#1a237e', marginBottom: '1rem' }}>404 - Page Not Found</h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div>
          <button 
            style={primaryButtonStyle}
            onClick={() => navigate(-1)}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0d47a1'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1a237e'}
          >
            Go Back
          </button>
          <button 
            style={secondaryButtonStyle}
            onClick={() => navigate('/dashboard')}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#1a237e';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#1a237e';
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 