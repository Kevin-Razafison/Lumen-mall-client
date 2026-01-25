import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import logo from '../../assets/Lumen-Mall-logo.png'; 
import { Link } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Get login function
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        login(userData); // Save to context & localStorage
        navigate('/'); // Go home
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
        {/* Wrap your button in a Link or change it to a Link styled as a button */}
        <Link to="/register" className={styles.createAccountBtn} style={{textAlign: 'center', display: 'block'}}>
          Create your Lumen account
        </Link>
      </div>
    </div>
  );
};

export default Login;