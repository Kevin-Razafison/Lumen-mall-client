import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css'; 
import logo from '../../assets/Lumen-Mall-logo.png';
import { API_BASE_URL } from '../../config';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Could not connect to the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  if (isSuccess) {
    return (
      <div className={styles.loginContainer}>
        <img src={logo} alt="Lumen Mall" className={styles.logo} />
        <div className={styles.loginCard} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>✅</div>
          <h1 className={styles.title}>Account Created!</h1>
          <p style={{ marginBottom: '15px', color: '#555', lineHeight: '1.5' }}>
            Welcome, <strong>{formData.fullName}</strong>!
          </p>
          <p style={{ marginBottom: '25px', color: '#666', fontSize: '14px' }}>
            Please check your email to verify your account before signing in.
          </p>
          <button 
            onClick={() => navigate('/login')} 
            className={styles.signInBtn}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Lumen Mall" className={styles.logo} />
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Create Account</h1>
        
        {error && (
          <div 
            className={styles.errorMessage} 
            style={{ 
              backgroundColor: '#fcf4f4',
              border: '1px solid #d00',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '15px',
              color: '#c40000',
              fontSize: '13px'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Your Name</label>
          <input 
            type="text" 
            className={styles.input} 
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            disabled={loading}
            required 
            placeholder="First and last name"
          />
          
          <label className={styles.label}>Email</label>
          <input 
            type="email" 
            className={styles.input} 
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={loading}
            required 
            placeholder="name@example.com"
          />
          
          <label className={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              className={styles.input} 
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={loading}
              required 
              placeholder="At least 6 characters"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#007185',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className={styles.label}>Re-enter Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            className={styles.input} 
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
            required 
            placeholder="Type password again"
          />
          
          <button 
            type="submit" 
            className={styles.signInBtn} 
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create your Lumen account"}
          </button>
        </form>
        
        <p className={styles.disclaimer} style={{ marginTop: '15px' }}>
          By creating an account, you agree to Lumen Mall's Conditions of Use and Privacy Notice.
        </p>
        
        <p className={styles.disclaimer} style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{color: '#007185', fontWeight: '600'}}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
