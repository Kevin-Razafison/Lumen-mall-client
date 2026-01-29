import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import styles from './Login.module.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('No verification token provided.');
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/verify?token=${token}`);
        
        if (!isMounted) return;

        if (response.ok) {
          setStatus('success');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus('error');
          setErrorMessage(errorData.message || 'Verification link is invalid or expired.');
        }
      } catch (err) {
        console.error("Verification error:", err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Could not verify email. Please try again later.');
        }
      }
    };

    verify();

    return () => { 
      isMounted = false; 
    };
  }, [token]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>⌛</div>
            <h2 style={{ marginBottom: '10px' }}>Verifying your email...</h2>
            <p style={{ color: '#666' }}>Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ marginBottom: '15px', color: '#067d62' }}>Email Verified!</h2>
            <p style={{ color: '#555', marginBottom: '25px', lineHeight: '1.5' }}>
              Your account is now active. You can sign in to start shopping.
            </p>
            <button 
              onClick={() => navigate('/login')} 
              className={styles.signInBtn}
            >
              Go to Sign In
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ marginBottom: '15px', color: '#c40000' }}>Verification Failed</h2>
            <p style={{ color: '#555', marginBottom: '25px', lineHeight: '1.5' }}>
              {errorMessage || 'The verification link is invalid or has expired.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/login')} 
                className={styles.signInBtn}
                style={{ flex: 1, maxWidth: '200px' }}
              >
                Go to Login
              </button>
              <button 
                onClick={() => navigate('/register')} 
                className={styles.signInBtn}
                style={{ 
                  flex: 1, 
                  maxWidth: '200px',
                  backgroundColor: '#f0f0f0',
                  color: '#333'
                }}
              >
                Register Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
