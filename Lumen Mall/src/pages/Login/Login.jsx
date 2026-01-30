import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link } from 'react-router-dom'; 
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

  // Determine redirect target
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
      // 1. Attempt login via AuthContext
      const result = await login(email, password);
      
      // 2. Check for success
      if (result && result.success) {
        // Run location detection in background
        detectLocation();

        console.log("Login successful. Redirecting...");

        /**
         * BULLETPROOF REDIRECTION:
         * We use window.location.href instead of the navigate hook.
         * This prevents the "N is not a function" error in production
         * and ensures a clean state load upon entering the app.
         */
        window.location.href = from;

      } else {
        // Handle server-side rejection (e.g. 401 Unauthorized)
        setError(result?.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("LOGIN_FATAL_ERROR:", err);
      
      // Specific handling for NetworkError / Cold Starts
      if (err.name === 'AbortError' || err.message?.includes("fetch") || err.message?.includes("NetworkError")) {
        setError("The server is taking too long to respond (Cold Start). Please wait 10 seconds and try again.");
      } else {
        setError(`System Error: ${err.message || 'An unexpected error occurred'}`);
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
            autoComplete="username"
            required 
          />
          
          <label className={styles.label}>Password</label>
          <input 
            type="password" 
            className={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required 
          />
          
          <button 
            type="submit" 
            className={styles.signInBtn} 
            disabled={loading}
          >
            {loading ? "Connecting to Server..." : "Continue"}
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