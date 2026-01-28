import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css'; 
import logo from '../../assets/Lumen-Mall-logo.png';
import { API_BASE_URL } from '../../config';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle state
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Client-side Validation: Match passwords
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // 2. Client-side Validation: Length check
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
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
        setError(errorData.message || "Registration failed.");
      }
    } catch (error) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.loginContainer}>
        <img src={logo} alt="Lumen Mall" className={styles.logo} />
        <div className={styles.loginCard} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>✅</div>
          <h1 className={styles.title}>Account Created!</h1>
          <p style={{ marginBottom: '25px', color: '#555' }}>
            Welcome, <strong>{formData.fullName}</strong>! You can now sign in.
          </p>
          <button onClick={() => navigate('/login')} className={styles.signInBtn}>
            Sign In
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
        
        {error && <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '10px' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Your Name</label>
          <input 
            type="text" className={styles.input} required 
            onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
          />
          
          <label className={styles.label}>Email</label>
          <input 
            type="email" className={styles.input} required 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          
          <label className={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              className={styles.input} 
              required 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
            {/* Show/Hide Toggle Button */}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#007185' }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className={styles.label}>Re-enter Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            className={styles.input} 
            required 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
          
          <button type="submit" className={styles.signInBtn} disabled={loading}>
            {loading ? "Checking..." : "Create your account"}
          </button>
        </form>
        
        <p className={styles.disclaimer}>
          Already have an account? <Link to="/login" style={{color: '#007185'}}>Sign-In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;