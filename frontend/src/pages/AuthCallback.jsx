import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/layout/Container';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No OAuth code provided in authorization callback');
      return;
    }

    const processAuth = async () => {
      try {
        const user = await handleOAuthCallback(code);
        if (user.githubUsername) {
          navigate(`/profile/${user.githubUsername}`);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('GitHub Auth Callback Error:', err);
        setError(err.response?.data?.message || 'Authentication with GitHub failed.');
      }
    };

    processAuth();
  }, [searchParams]);

  return (
    <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', background: 'rgba(20, 24, 33, 0.85)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
        {error ? (
          <div>
            <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Authentication Failed</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#22c55e', borderRadius: '50%', margin: '0 auto 1.5rem auto', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ color: '#fff' }}>Authenticating with GitHub...</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Please wait while we log you in.</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AuthCallback;
