import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaGithub, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import Container from '../components/layout/Container';
import styles from './Auth.module.css';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [githubUsernameInput, setGithubUsernameInput] = useState('');
  const [showDirectGh, setShowDirectGh] = useState(false);

  const { register, loginWithGithubDirect } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(name, email, password, githubUsername.trim());
      if (user.githubUsername) {
        navigate(`/profile/${user.githubUsername}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubOAuth = async () => {
    setError('');
    try {
      const res = await axiosInstance.get('/auth/github/url');
      if (res.data.configured && res.data.url) {
        window.location.href = res.data.url;
      } else {
        setShowDirectGh(true);
      }
    } catch (err) {
      setShowDirectGh(true);
    }
  };

  const handleDirectGhLogin = async (e) => {
    e.preventDefault();
    if (!githubUsernameInput.trim()) return;
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGithubDirect(githubUsernameInput.trim());
      navigate(`/profile/${user.githubUsername}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not authenticate with that GitHub username.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2 className={styles.authTitle}>Create Account</h2>
          <p className={styles.authSubtitle}>Join GitPeek to explore developer insights</p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.socialAuthSection}>
          <button
            type="button"
            className={styles.githubBtn}
            onClick={handleGithubOAuth}
            disabled={loading}
          >
            <FaGithub style={{ fontSize: '1.2rem' }} />
            <span>Sign up with GitHub</span>
          </button>

          {showDirectGh && (
            <form onSubmit={handleDirectGhLogin} className={styles.directGhModal}>
              <div className={styles.inputGroup} style={{ marginTop: '0.8rem' }}>
                <label className={styles.label}>Enter GitHub Username to Instant Connect:</label>
                <div className={styles.inputWrapper}>
                  <FaGithub className={styles.inputIcon} />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. torvalds or octocat"
                    value={githubUsernameInput}
                    onChange={(e) => setGithubUsernameInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className={styles.submitBtn}
                style={{ marginTop: '0.75rem', background: '#334155' }}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect GitHub Account'}
              </button>
            </form>
          )}
        </div>


        <div className={styles.divider}>
          <span>or register with email</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <FaEnvelope className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                className={styles.input}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>GitHub Username (Optional)</label>
            <div className={styles.inputWrapper}>
              <FaGithub className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. torvalds"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account?
          <Link to="/login" className={styles.authLink}>
            Sign In
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default Signup;
