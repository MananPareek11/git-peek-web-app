import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaCodeBranch, FaExclamationCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { timeAgo } from '../../utils/formatDate';
import Card from '../common/Card';
import Badge from '../common/Badge';
import LanguageBadge from './LanguageBadge';
import styles from './RepoCard.module.css';

export const RepoCard = ({ repo }) => {
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

