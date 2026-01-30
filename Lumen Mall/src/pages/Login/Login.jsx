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
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/";

  /**
   * REFACTORED: detectLocation now returns a Promise
   * This allows us to use 'await' in the handleSubmit function.
   */
  const detectLocation = () => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(); // Geolocation not supported, just move on
        return;
      }

      setIsDetecting(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address.city || data.address.town || "Unknown City";
            const state = data.address.state || data.address.country;
            setLocation(`${city}, ${state}`);
          } catch (err) {
            console.error("Reverse Geocode Error:", err);
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          } finally {
            setIsDetecting(false);
            resolve(); // Finished successfully
          }
        },
        (err) => {
          console.error("Geolocation Error:", err);
          setIsDetecting(false);
          resolve(); // Resolve anyway so we don't block the user forever
        },
        { timeout: 5000 } // Don't wait more than 5 seconds
      );
    });
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
      
      if (result && result.success) {

        await detectLocation();

        console.log("Login and Location check complete. Navigating...");

        // 3. Final Redirect
        navigate(from, { replace: true });

      } else {
        setError(result?.message || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err) {
      console.error("LOGIN_FATAL_ERROR:", err);
      if (err.name === 'AbortError' || err.message?.includes("fetch")) {
        setError("The server is taking too long to respond. Please wait 10 seconds.");
      } else {
        setError(`System Error: ${err.message || 'An unexpected error occurred'}`);
      }
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
                  style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: '13px' }}
                >
                  Resend verification email?
                </button>
                {resendMessage && <p style={{ color: '#067d62', marginTop: '5px', fontSize: '12px' }}>{resendMessage}</p>}
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
            autoComplete="username"
          />
          
          <label className={styles.label}>Password</label>
          <input 
            type="password" 
            className={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required 
            autoComplete="current-password"
          />
          
          <button type="submit" className={styles.signInBtn} disabled={loading}>
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
        
        <p className={styles.disclaimer}>
          By continuing, you agree to Lumen Mall's Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.divider}><h5>New to Lumen Mall?</h5></div>
        <Link to="/register" className={styles.createAccountBtn} style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
          Create your Lumen account
        </Link>
      </div>
    </div>
  );
};

export default Login;