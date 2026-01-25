import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css'; // Reusing your Login styles
import logo from '../../assets/Lumen-Mall-logo.png';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Account created successfully!");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <img src={logo} alt="Lumen Mall" className={styles.logo} />
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Create Account</h1>
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
          <input 
            type="password" className={styles.input} required 
            placeholder="At least 6 characters"
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          
          <button type="submit" className={styles.signInBtn}>Verify email</button>
        </form>
        <p className={styles.disclaimer}>
          Already have an account? <Link to="/login" style={{color: '#007185'}}>Sign-In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;