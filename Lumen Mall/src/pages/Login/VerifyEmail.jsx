import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import styles from './Login.module.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    let isMounted = true; // 1. Create a flag

    const verify = async () => {
      if (!token || status !== 'verifying') return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/verify?token=${token}`);
        if (!isMounted) return; // 2. Don't update state if component unmounted

        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        if (isMounted) setStatus('error');
      }
    };

    verify();
    
    return () => { isMounted = false; }; // 3. Cleanup function
  }, [token]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard} style={{ textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <h2>Verifying your email...</h2>
            <div className="spinner">⌛</div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '50px' }}>✅</div>
            <h2>Email Verified!</h2>
            <p>Your account is now active. You can sign in to start shopping.</p>
            <button onClick={() => navigate('/login')} className={styles.signInBtn}>
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '50px' }}>❌</div>
            <h2>Verification Failed</h2>
            <p>The link is invalid or has expired.</p>
            <button onClick={() => navigate('/register')} className={styles.signInBtn}>
              Try Registering Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;