import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
import { useSearch } from '../../context/SearchContext';
import styles from './FavoritesModal.module.css';

export const FavoritesModal = ({ isOpen, onClose }) => {
  const { favorites, toggleFavorite } = useSearch();

  if (!isOpen) return null;

  const handleDelete = (username, e) => {
    e.stopPropagation();
    toggleFavorite(username);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <FaHeart className={styles.titleIcon} />
            <h2 className={styles.title}>Favorite Developers ({favorites.length})</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {/* Favorites List Content */}
        <div className={styles.listContent}>
          {favorites.length > 0 ? (
            favorites.map((item) => (
              <div key={item.username} className={styles.itemCard}>
                <div className={styles.itemLeft}>
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.username} className={styles.itemAvatar} />
                  ) : (
                    <FaUser style={{ fontSize: '1.5rem', color: '#ef4444' }} />
                  )}
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemTitle}>
                      <Link to={`/profile/${item.username}`} onClick={onClose} className={styles.itemLink}>
                        @{item.username}
                      </Link>
                    </h4>
                    <p className={styles.itemDesc}>{item.name || `Developer Profile`}</p>
                  </div>
                </div>

                {/* Explicit Remove / Delete Button */}
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(item.username, e)}
                  title="Remove from favorites"
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FaHeart className={styles.emptyIcon} />
              <h4>No favorites saved yet</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Click the heart icon on any developer profile to add them to your favorites.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesModal;
