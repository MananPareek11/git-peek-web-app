import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaCodeBranch, FaExclamationCircle, FaExternalLinkAlt, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { timeAgo } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import LanguageBadge from './LanguageBadge';
import styles from './RepoCard.module.css';

export const RepoCard = ({ repo }) => {
  const { isBookmarked, toggleBookmark } = useAuth();
  const targetId = `${repo.owner}/${repo.name}`;
  const bookmarked = isBookmarked(targetId);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({
      type: 'repository',
      targetId,
      title: `${repo.owner}/${repo.name}`,
      avatar: repo.ownerAvatar || '',
      url: `/repo/${repo.owner}/${repo.name}`,
      description: repo.description || 'GitHub Repository',
      language: repo.language || '',
      stars: repo.stars || 0,
    });
  };

  return (
    <Card className={styles.repoCard} hover glass>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title} title={repo.name}>
            <Link
              to={`/repo/${repo.owner}/${repo.name}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {repo.name}
            </Link>
          </h3>
          <Badge variant="outline" size="sm" className={styles.visibilityBadge}>
            {repo.visibility}
          </Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleBookmark}
            style={{
              background: 'transparent',
              border: 'none',
              color: bookmarked ? '#eab308' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
            }}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark repository'}
          >
            {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          <a 
            href={repo.repoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.openBtn}
            title="Open repository in GitHub"
            aria-label="Open repository in GitHub"
          >
            <FaExternalLinkAlt />
          </a>
        </div>
      </div>


      <p className={styles.description} title={repo.description}>
        {repo.description || <span className={styles.noDescription}>No description provided.</span>}
      </p>

      {/* Stats and Info row */}
      <div className={styles.statsRow}>
        <div className={styles.leftStats}>
          {repo.language && <LanguageBadge language={repo.language} />}
          
          <div className={styles.statItem} title={`${repo.stars} stars`}>
            <FaStar className={styles.starIcon} />
            <span>{repo.stars}</span>
          </div>

          <div className={styles.statItem} title={`${repo.forks} forks`}>
            <FaCodeBranch className={styles.forkIcon} />
            <span>{repo.forks}</span>
          </div>

          {repo.issues > 0 && (
            <div className={styles.statItem} title={`${repo.issues} open issues`}>
              <FaExclamationCircle className={styles.issueIcon} />
              <span>{repo.issues}</span>
            </div>
          )}
        </div>

        <div className={styles.rightInfo}>
          <span className={styles.updatedText} title={`Last updated: ${repo.updatedAtGithub}`}>
            Updated {timeAgo(repo.updatedAtGithub)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default RepoCard;

