import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGithub, FaInfoCircle, FaHome, FaSignOutAlt, FaSignInAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';
import Container from './Container';

export const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <Container className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          <FaGithub className={styles.logoIcon} />
          <span>Git<span style={{ color: "lightgreen" }}>Peek</span></span>
        </Link>

        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            <FaHome className={styles.linkIcon} />
            <span>Home</span>
          </Link>
          <Link
            to="/about"
            className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
          >
            <FaInfoCircle className={styles.linkIcon} />
            <span>About</span>
          </Link>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to={user.githubUsername ? `/profile/${user.githubUsername}` : '/'}
                className={styles.userBadge}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                ) : (
                  <FaUser style={{ margin: '0 4px', color: '#22c55e' }} />
                )}
                <span>{user.name || user.githubUsername}</span>
              </Link>
              <button onClick={logout} className={styles.logoutBtn} title="Sign Out">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              <FaSignInAlt />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </Container>
    </header>
  );
};

export default Navbar;
