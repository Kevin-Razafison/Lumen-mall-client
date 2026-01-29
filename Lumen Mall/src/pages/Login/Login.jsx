import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom'; 
import { useUserLocation } from '../../context/LocationContext'; 
import styles from './Login.module.css'; 
import logo from '../../assets/Lumen-Mall-logo.png'; 
import { API_BASE_URL } from '../../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false); 

  const { login } = useAuth();
  const { setLocation, setIsDetecting } = useUserLocation(); 
  const location = useLocation();
  const navigate = useNavigate(); // ← FIX: Add this line

  const from = location.state?.from?.pathname || "/";

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || "Unknown City";
            const state = data.address.state || data.address.country;
            setLocation(`${city}, ${state}`);
          } catch (err) {
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          } finally {
            setIsDetecting(false);
          }
        },
        () => setIsDetecting(false)
      );
    }
  };

  const handleResendEmail = async () => {
    setResendMessage('Sending...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setResendMessage(data.message || 'Verification email resent!');
    } catch (err) {
      setResendMessage("Failed to resend email.");
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Attempt login
      const result = await login(email, password);
      
      // 2. Check for success explicitly
      if (result && result.success) {
        // Start location detection (don't await, let it run in background)
        detectLocation();

        const target = from || "/";
        console.log("Login successful. Redirecting to:", target);

        // 3. FIX: Use navigate instead of window.location.href
        navigate(target, { replace: true });
      } else {
        // Handle server-side rejection (e.g. 401 Unauthorized)
        setError(result?.message || "Invalid email or password.");
      }
    } catch (err) {
      // This catches the "NetworkError" or internal JS crashes
      console.error("LOGIN_HANDLE_SUBMIT_ERROR:", err);
      
      if (typeof err?.message === 'string' && err.message.includes("NetworkError")) {
        setError("Network error: Check your internet or backend status.");
      } else {
        setError(`UI Error: ${err.message || 'An unexpected error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Lumen Mall" className={styles.logo} />

      <div className={styles.loginCard}>
        <h1 className={styles.title}>Sign-In</h1>

        {error && (
          <div className={styles.errorBox} style={{
            backgroundColor: '#fcf4f4',
            border: '1px solid #d00',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '15px',
            color: '#111',
            fontSize: '13px'
          }}>
            <h4 style={{ color: '#c40000', margin: '0 0 5px 0' }}>There was a problem</h4>
            <p style={{ margin: '0 0 10px 0' }}>{error}</p>
            
            {error.toLowerCase().includes("verify") && (
              <div style={{ marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                <button 
                  onClick={handleResendEmail}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#007185', 
                    cursor: 'pointer', 
                    padding: 0, 
                    textDecoration: 'underline',
                    fontSize: '13px'
                  }}
                >
                  Resend verification email?
                </button>
                {resendMessage && (
                  <p style={{ 
                    color: resendMessage.includes('Failed') ? '#c40000' : '#067d62', 
                    marginTop: '5px', 
                    fontSize: '12px' 
                  }}>
                    {resendMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email or mobile phone number</label>
          <input 
            type="email" 
            className={styles.input} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required 
          />
          
          <label className={styles.label}>Password</label>
          <input 
            type="password" 
            className={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required 
          />
          
          <button 
            type="submit" 
            className={styles.signInBtn} 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
        
        <p className={styles.disclaimer}>
          By continuing, you agree to Lumen Mall's Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.divider}>
          <h5>New to Lumen Mall?</h5>
        </div>
        <Link 
          to="/register" 
          className={styles.createAccountBtn} 
          style={{
            textAlign: 'center', 
            display: 'block', 
            textDecoration: 'none'
          }}
        >
          Create your Lumen account
        </Link>
      </div>
    </div>
  );
};

export default Login;
