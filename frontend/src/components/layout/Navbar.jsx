import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGithub, FaInfoCircle, FaHome, FaSignOutAlt, FaSignInAlt, FaUser, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import BookmarksModal from '../common/BookmarksModal';
import styles from './Navbar.module.css';
import Container from './Container';

export const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, bookmarks, logout } = useAuth();
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
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
                <button
                  onClick={() => setIsBookmarksOpen(true)}
                  className={styles.navLink}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308' }}
                  title="View Saved Bookmarks"
                >
                  <FaBookmark />
                  <span>Bookmarks</span>
                  {bookmarks.length > 0 && (
                    <span
                      style={{
                        background: '#eab308',
                        color: '#0f172a',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '10px',
                      }}
                    >
                      {bookmarks.length}
                    </span>
                  )}
                </button>

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

      <BookmarksModal isOpen={isBookmarksOpen} onClose={() => setIsBookmarksOpen(false)} />
    </>
  );
};

export default Navbar;

