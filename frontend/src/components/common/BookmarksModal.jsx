import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaTimes, FaTrash, FaUser, FaBook, FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './BookmarksModal.module.css';

export const BookmarksModal = ({ isOpen, onClose }) => {
  const { bookmarks, removeBookmark } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'profile', 'repository'

  if (!isOpen) return null;

  const filteredBookmarks = bookmarks.filter((b) => {
    if (activeTab === 'profile') return b.type === 'profile';
    if (activeTab === 'repository') return b.type === 'repository';
    return true;
  });

  const handleDelete = async (targetId, e) => {
    e.stopPropagation();
    await removeBookmark(targetId);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <FaBookmark className={styles.titleIcon} />
            <h2 className={styles.title}>Saved Bookmarks ({bookmarks.length})</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({bookmarks.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profiles ({bookmarks.filter((b) => b.type === 'profile').length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'repository' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('repository')}
          >
            Repositories ({bookmarks.filter((b) => b.type === 'repository').length})
          </button>
        </div>

        {/* Bookmarks List Content */}
        <div className={styles.listContent}>
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((item) => (
              <div key={item.targetId} className={styles.itemCard}>
                <div className={styles.itemLeft}>
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.title} className={styles.itemAvatar} />
                  ) : item.type === 'profile' ? (
                    <FaUser style={{ fontSize: '1.5rem', color: '#22c55e' }} />
                  ) : (
                    <FaBook style={{ fontSize: '1.5rem', color: '#38bdf8' }} />
                  )}
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>
                      <Link to={item.url} onClick={onClose} className={styles.itemLink}>
                        {item.title}
                      </Link>
                    </h4>
                    <p className={styles.itemDesc}>
                      {item.description || (item.type === 'profile' ? 'Developer Profile' : 'GitHub Repository')}
                    </p>
                    {item.language && (
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem', display: 'inline-block' }}>
                        {item.language} {item.stars > 0 && `• ⭐ ${item.stars}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Explicit Delete Button */}
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(item.targetId, e)}
                  title="Remove Bookmark"
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FaBookmark className={styles.emptyIcon} />
              <h4>No bookmarks found</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                {activeTab === 'all'
                  ? 'Click the bookmark icon on any developer profile or repository to save it here.'
                  : `You haven't bookmarked any ${activeTab}s yet.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarksModal;
