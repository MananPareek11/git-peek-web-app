import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaStar,
  FaCodeBranch,
  FaExclamationCircle,
  FaEye,
  FaArrowLeft,
  FaExternalLinkAlt,
  FaBook,
  FaHistory,
  FaRobot,
  FaCode,
  FaBalanceScale,
  FaCalendarAlt,
  FaDatabase,
  FaUpload,
  FaUser,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';
import Container from '../components/layout/Container';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LanguageBadge from '../components/repository/LanguageBadge';
import MarkdownViewer from '../components/repository/MarkdownViewer';
import ErrorState from '../components/common/ErrorState';
import { getRepoDetails } from '../services/githubApi';
import { useAuth } from '../context/AuthContext';
import { timeAgo, formatDate } from '../utils/formatDate';
import styles from './RepoDetail.module.css';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
};

export const RepoDetail = () => {
  const { owner, repo } = useParams();
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isBookmarked, toggleBookmark } = useAuth();

  const targetId = `${owner}/${repo}`;
  const bookmarked = isBookmarked(targetId);

  const handleBookmarkToggle = () => {
    if (!repoData) return;
    toggleBookmark({
      type: 'repository',
      targetId,
      title: `${owner}/${repo}`,
      avatar: repoData.ownerAvatar || '',
      url: `/repo/${owner}/${repo}`,
      description: repoData.description || 'GitHub Repository',
      language: repoData.language || '',
      stars: repoData.stars || 0,
    });
  };

  const fetchRepo = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getRepoDetails(owner, repo);
      setRepoData(data);
    } catch (err) {
      console.error('Failed to load repository details:', err);
      setError(err.response?.data?.message || `Could not fetch repository '${owner}/${repo}'`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepo();
  }, [owner, repo]);

  if (loading) {
    return (
      <Container className={styles.container}>
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTopColor: '#22c55e',
              borderRadius: '50%',
              margin: '0 auto 1.5rem auto',
              animation: 'spin 1s linear infinite',
            }}
          />
          <h3 style={{ color: '#fff' }}>Loading repository insights...</h3>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.container}>
        <div className={styles.backRow}>
          <Link to={`/profile/${owner}`}>
            <Button variant="secondary" icon={FaArrowLeft}>
              Back to Profile
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Repository Load Failed"
          message={error}
          onRetry={fetchRepo}
          retryLabel="Retry Loading"
        />
      </Container>
    );
  }

  if (!repoData) return null;

  // Language percentage calculations
  const totalLangBytes = Object.values(repoData.languages || {}).reduce((acc, bytes) => acc + bytes, 0);
  const langList = Object.entries(repoData.languages || {}).map(([name, bytes]) => ({
    name,
    bytes,
    pct: totalLangBytes > 0 ? ((bytes / totalLangBytes) * 100).toFixed(1) : 0,
    color: LANG_COLORS[name] || '#8b949e',
  }));

  const sizeMb = repoData.sizeKb ? (repoData.sizeKb / 1024).toFixed(2) : '0';

  return (
    <Container className={`${styles.container} animate-fade-in`}>
      {/* Navigation Breadcrumb Row */}
      <div className={styles.backRow}>
        <Link to={`/profile/${owner}`}>
          <Button variant="secondary" icon={FaArrowLeft} size="sm">
            Back to @{owner}'s Profile
          </Button>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div className={styles.titleGroup}>
            {repoData.ownerAvatar ? (
              <img src={repoData.ownerAvatar} alt={owner} className={styles.ownerAvatar} />
            ) : (
              <FaUser style={{ fontSize: '2rem', color: '#22c55e' }} />
            )}
            <div>
              <h1 className={styles.repoTitle}>
                <Link to={`/profile/${repoData.owner}`} className={styles.ownerName} style={{ textDecoration: 'none' }}>
                  {repoData.owner}
                </Link>{' '}
                / {repoData.name}
              </h1>
              <div className={styles.badgeGroup} style={{ marginTop: '0.4rem' }}>
                <Badge variant="outline" size="sm">
                  {repoData.visibility}
                </Badge>
                {repoData.language && <LanguageBadge language={repoData.language} />}
                <Badge variant="secondary" size="sm">
                  Default Branch: {repoData.defaultBranch}
                </Badge>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleBookmarkToggle}
              style={{
                background: bookmarked ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${bookmarked ? 'rgba(234, 179, 8, 0.4)' : 'rgba(255, 255, 255, 0.15)'}`,
                color: bookmarked ? '#eab308' : '#e2e8f0',
                padding: '0.6rem 1.1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark repository'}
            >
              {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark Repo'}</span>
            </button>
            <a
              href={repoData.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openGithubBtn}
            >
              <FaExternalLinkAlt />
              <span>Open on GitHub</span>
            </a>
          </div>
        </div>


        <p className={styles.description}>
          {repoData.description || 'No description provided for this repository.'}
        </p>

        {/* Topics */}
        {repoData.topics && repoData.topics.length > 0 && (
          <div className={styles.topicsContainer}>
            {repoData.topics.map((t) => (
              <span key={t} className={styles.topicBadge}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Key Stats Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <FaStar className={styles.statIcon} style={{ color: '#eab308' }} />
          <div>
            <div className={styles.statVal}>{repoData.stars}</div>
            <div className={styles.statLbl}>Stars</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaCodeBranch className={styles.statIcon} style={{ color: '#3b82f6' }} />
          <div>
            <div className={styles.statVal}>{repoData.forks}</div>
            <div className={styles.statLbl}>Forks</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaExclamationCircle className={styles.statIcon} style={{ color: '#ef4444' }} />
          <div>
            <div className={styles.statVal}>{repoData.openIssues}</div>
            <div className={styles.statLbl}>Open Issues</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaEye className={styles.statIcon} style={{ color: '#a855f7' }} />
          <div>
            <div className={styles.statVal}>{repoData.subscribers}</div>
            <div className={styles.statLbl}>Watchers</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <FaDatabase className={styles.statIcon} style={{ color: '#14b8a6' }} />
          <div>
            <div className={styles.statVal}>{sizeMb} MB</div>
            <div className={styles.statLbl}>Repository Size</div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Summary Section */}
      <div className={styles.aiSummaryCard}>
        <div className={styles.aiSummaryHeader}>
          <FaRobot className={styles.aiIcon} />
          <h3 className={styles.aiTitle}>AI Repository Summary</h3>
        </div>
        <p className={styles.aiText}>
          This repository is authored by <strong>{repoData.owner}</strong>. It is built primarily using{' '}
          <strong>{repoData.language}</strong> with a default branch of <code>{repoData.defaultBranch}</code>.
          {repoData.stars > 50
            ? ` Highly popular with over ${repoData.stars} stars!`
            : ` Active project last updated ${timeAgo(repoData.updatedAt)}.`}
        </p>
        <div className={styles.techGrid}>
          <div className={styles.techItem}>
            <FaBalanceScale style={{ marginRight: '6px', color: '#22c55e' }} />
            License: {repoData.license}
          </div>
          <div className={styles.techItem}>
            <FaCode style={{ marginRight: '6px', color: '#38bdf8' }} />
            Primary Language: {repoData.language}
          </div>
          <div className={styles.techItem}>
            <FaCalendarAlt style={{ marginRight: '6px', color: '#f59e0b' }} />
            Created: {formatDate(repoData.createdAt)}
          </div>
          <div className={styles.techItem}>
            <FaUpload style={{ marginRight: '6px', color: '#a855f7' }} />
            Last Pushed: {timeAgo(repoData.pushedAt)}
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column: README Viewer */}
        <section className={styles.readmeSection}>
          <div className={styles.sectionHeading}>
            <FaBook style={{ color: '#22c55e' }} />
            <span>README.md</span>
          </div>
          {repoData.readme ? (
            <MarkdownViewer content={repoData.readme} />
          ) : (
            <div className={styles.noContent}>No README file available for this repository.</div>
          )}
        </section>

        {/* Right Column: Languages & Commits */}
        <aside className={styles.sidebar}>
          {/* Languages breakdown */}
          <div className={styles.sideCard}>
            <div className={styles.sectionHeading} style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              <FaCode style={{ color: '#38bdf8' }} />
              <span>Languages Breakdown</span>
            </div>
            {langList.length > 0 ? (
              <>
                <div className={styles.langBarContainer}>
                  {langList.map((l) => (
                    <div
                      key={l.name}
                      className={styles.langSegment}
                      style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                      title={`${l.name}: ${l.pct}%`}
                    />
                  ))}
                </div>
                <div className={styles.langList}>
                  {langList.map((l) => (
                    <div key={l.name} className={styles.langItem}>
                      <div className={styles.langDotName}>
                        <span className={styles.langDot} style={{ backgroundColor: l.color }} />
                        <span>{l.name}</span>
                      </div>
                      <span className={styles.langPct}>{l.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.noContent}>No language breakdown detected.</div>
            )}
          </div>

          {/* Recent Commits */}
          <div className={styles.sideCard}>
            <div className={styles.sectionHeading} style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              <FaHistory style={{ color: '#a855f7' }} />
              <span>Recent Activity (Commits)</span>
            </div>
            {repoData.commits && repoData.commits.length > 0 ? (
              <div className={styles.commitsList}>
                {repoData.commits.slice(0, 6).map((c) => (
                  <div key={c.sha} className={styles.commitItem}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.commitMsg}
                      style={{ textDecoration: 'none' }}
                    >
                      {c.message.split('\n')[0]}
                    </a>
                    <div className={styles.commitMeta}>
                      {c.avatar && (
                        <img src={c.avatar} alt={c.author} className={styles.commitAuthorAvatar} />
                      )}
                      <span>{c.author}</span> • <span>{timeAgo(c.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noContent}>No recent commit data.</div>
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default RepoDetail;

