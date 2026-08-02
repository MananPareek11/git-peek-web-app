import React from 'react';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaLink, 
  FaTwitter, 
  FaGithub, 
  FaCalendarAlt, 
  FaSync, 
  FaHeart, 
  FaRegHeart,
  FaBookmark,
  FaRegBookmark
} from 'react-icons/fa';
import { useSearch } from '../../context/SearchContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import styles from './ProfileCard.module.css';

export const ProfileCard = ({ user, onRefresh, refreshing, source }) => {
  const { toggleFavorite, isFavorite } = useSearch();
  const { isBookmarked, toggleBookmark } = useAuth();

  const favState = isFavorite(user.username);
  const bookmarked = isBookmarked(user.username);

  const handleBookmarkToggle = () => {
    toggleBookmark({
      type: 'profile',
      targetId: user.username,
      title: user.name || user.username,
      avatar: user.avatar,
      url: `/profile/${user.username}`,
      description: user.bio || `Developer profile @${user.username}`,
    });
  };

  const getSourceLabel = () => {
    if (source === 'cache') return 'Cached (DB)';
    if (source === 'github') return 'GitHub Live';
    if (source === 'github_refresh') return 'Refreshed';
    return 'Database';
  };

  const getCleanUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  return (
    <Card className={styles.profileCard}>
      {/* Top Banner section */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <img src={user.avatar} alt={`${user.name}'s avatar`} className={styles.avatar} />
          {user.hireable && (
            <Badge variant="success" size="sm" className={styles.hireableBadge}>
              Hireable
            </Badge>
          )}
        </div>

        <div className={styles.meta}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>{user.name || user.username}</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleBookmarkToggle}
                className={styles.favBtn}
                title={bookmarked ? 'Remove bookmark' : 'Save bookmark'}
                style={{ color: bookmarked ? '#eab308' : '#94a3b8' }}
              >
                {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              </button>
              <button
                onClick={() => toggleFavorite(user.username, user.avatar)}
                className={styles.favBtn}
                title={favState ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={favState ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favState ? <FaHeart className={styles.heartFilled} /> : <FaRegHeart className={styles.heartOutline} />}
              </button>
            </div>
          </div>

          <a 
            href={user.profileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.username}
          >
            @{user.username}
          </a>
          
          <div className={styles.joinedRow}>
            <FaCalendarAlt className={styles.calendarIcon} />
            <span>Joined {formatDate(user.createdAtGithub)}</span>
          </div>
        </div>
      </div>

      {/* Source Status info */}
      <div className={styles.sourceRow}>
        <Badge variant={source === 'cache' ? 'primary' : 'success'} size="sm">
          Source: {getSourceLabel()}
        </Badge>
        <span className={styles.lastFetchedText}>
          Synced {formatDate(user.lastFetched)}
        </span>
      </div>

      {/* Bio section */}
      {user.bio && (
        <div className={styles.bioContainer}>
          <p className={styles.bio}>{user.bio}</p>
        </div>
      )}

      {/* User details table */}
      <div className={styles.details}>
        {user.location && (
          <div className={styles.detailItem}>
            <FaMapMarkerAlt className={styles.detailIcon} />
            <span className={styles.detailText}>{user.location}</span>
          </div>
        )}
        {user.company && (
          <div className={styles.detailItem}>
            <FaBuilding className={styles.detailIcon} />
            <span className={styles.detailText}>{user.company}</span>
          </div>
        )}
        {user.blog && (
          <div className={styles.detailItem}>
            <FaLink className={styles.detailIcon} />
            <a 
              href={getCleanUrl(user.blog)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.detailText} ${styles.link}`}
            >
              {user.blog}
            </a>
          </div>
        )}
        {user.twitter && (
          <div className={styles.detailItem}>
            <FaTwitter className={styles.detailIcon} />
            <a 
              href={`https://twitter.com/${user.twitter}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${styles.detailText} ${styles.link}`}
            >
              @{user.twitter}
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" className={styles.githubBtnLink}>
          <Button variant="primary" size="md" icon={FaGithub} className={styles.fullWidthBtn}>
            GitHub Profile
          </Button>
        </a>
        <Button 
          variant="secondary" 
          size="md" 
          icon={FaSync} 
          onClick={onRefresh}
          loading={refreshing}
          className={styles.refreshBtn}
        >
          Refresh Cache
        </Button>
      </div>
    </Card>
  );
};

export default ProfileCard;
