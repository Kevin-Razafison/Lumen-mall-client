import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom'; 
import { useLocation } from '../../context/LocationContext'; 
import styles from './Login.module.css'; // Don't forget to import your styles!
import logo from '../../assets/Lumen-Mall-logo.png'; 
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { setLocation,setIsDetecting  } = useLocation(); 
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const from = routerLocation.state?.from?.pathname || "/";

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setIsDetecting(true); // Start Shimmer
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
            setIsDetecting(false); // Stop Shimmer
          }
        },
        (error) => {
          setIsDetecting(false); // Stop Shimmer on error
          console.error("Location denied");
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      
      if (success) {
        detectLocation(); // Automation fires here
        navigate(from, { replace: true });
      } else {
        alert("Invalid email or password");
      }
    } catch (err) {
      alert("Server error. Is the backend running?");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Lumen Mall" className={styles.logo} />

      <div className={styles.loginCard}>
        <h1 className={styles.title}>Sign-In</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email or mobile phone number</label>
          <input 
            type="email" 
            className={styles.input} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          
          <label className={styles.label}>Password</label>
          <input 
            type="password" 
            className={styles.input} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <button type="submit" className={styles.signInBtn}>Continue</button>
        </form>
        
        <p className={styles.disclaimer}>
          By continuing, you agree to Lumen Mall's Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className={styles.footer}>
        <div className={styles.divider}>
          <h5>New to Lumen Mall?</h5>
        </div>
        <Link to="/register" className={styles.createAccountBtn} style={{textAlign: 'center', display: 'block'}}>
          Create your Lumen account
        </Link>
      </div>
    </div>
  );
};

export default Login;