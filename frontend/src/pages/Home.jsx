import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaHeart, 
  FaHistory, 
  FaTrash, 
  FaDatabase, 
  FaStar, 
  FaUserAlt, 
  FaFolderOpen,
  FaArrowRight 
} from 'react-icons/fa';
import { useSearch } from '../context/SearchContext';
import Container from '../components/layout/Container';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import styles from './Home.module.css';

export const Home = () => {
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { 
    recentSearches, 
    cachedUsers, 
    favorites,
    loadingHistory,
    loadingCached,
    fetchHistory,
    fetchCached,
    removeUserFromCache
  } = useSearch();

  // Load history and cached users from DB on mount
  useEffect(() => {
    fetchHistory();
    fetchCached();
  }, [fetchHistory, fetchCached]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      setError('Please enter a GitHub username');
      return;
    }
    setError('');
    navigate(`/profile/${query}`);
  };

  const handleQuickSearch = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleDeleteCache = async (e, id, username) => {
    e.stopPropagation(); // prevent card click navigation
    if (window.confirm(`Are you sure you want to remove ${username} from the cache database?`)) {
      try {
        await removeUserFromCache(id, username);
      } catch (err) {
        alert('Failed to delete cache: ' + err.message);
      }
    }
  };

  return (
    <Container className={`${styles.homeContainer} animate-fade-in`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <FaDatabase /> Powered by Express & MongoDB Caching
        </div>
        <h1 className={styles.heroTitle}>
          GitPeek
        </h1>
        <p className={styles.heroSubtitle}>
          Look up GitHub developer profiles, statistics, and repositories. Cache profile states locally on a 24-hour cycle to improve performance and bypass API limits.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <Input
            placeholder="Search GitHub username (e.g. octocat, torvalds)..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (error) setError('');
            }}
            icon={FaSearch}
            error={error}
            className={styles.searchInput}
          />
          <Button type="submit" variant="primary" size="lg" className={styles.searchBtn}>
            <span>Explore</span> <FaArrowRight />
          </Button>
        </form>
      </section>

      {/* Favorites & Search History Section */}
      <div className={styles.historyGrid}>
        {/* Favorites */}
        <Card className={styles.historyCard}>
          <h3 className={styles.cardTitle}>
            <FaHeart className={styles.favIcon} /> Bookmarks & Favorites
          </h3>
          {favorites.length === 0 ? (
            <p className={styles.emptyText}>No developers favorited yet. Bookmark profiles from their detail screen to see them here.</p>
          ) : (
            <div className={styles.favoritesList}>
              {favorites.map((fav, idx) => {
                const username = typeof fav === 'string' ? fav : fav?.username;
                const avatar = typeof fav === 'string' ? `https://github.com/${fav}.png` : fav?.avatar;
                if (!username) return null;
                return (
                  <div 
                    key={username || idx} 
                    onClick={() => handleQuickSearch(username)}
                    className={styles.favItem}
                  >
                    <img src={avatar} alt={username} className={styles.favAvatar} />
                    <span className={styles.favUsername}>@{username}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Search Queries */}
        <Card className={styles.historyCard}>
          <h3 className={styles.cardTitle}>
            <FaHistory className={styles.historyIcon} /> Recent Search Queries
          </h3>
          {loadingHistory ? (
            <Loader message="" />
          ) : recentSearches.length === 0 ? (
            <p className={styles.emptyText}>Your search queries will appear here.</p>
          ) : (
            <div className={styles.historyTags}>
              {recentSearches.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleQuickSearch(item.username)}
                  className={styles.tagBtn}
                >
                  @{item.username}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Cached Database List */}
      <section className={styles.cachedSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaDatabase className={styles.dbIcon} /> Cached Profiles Explorer
          </h2>
          <Badge variant="primary" size="md">
            {cachedUsers.length} profile{cachedUsers.length !== 1 ? 's' : ''} stored
          </Badge>
        </div>
        
        {loadingCached ? (
          <Loader message="Reading MongoDB Cache..." />
        ) : cachedUsers.length === 0 ? (
          <Card className={styles.emptyDbCard}>
            <p className={styles.emptyText}>MongoDB is currently empty. Searched developer records will be stored here for caching.</p>
          </Card>
        ) : (
          <div className={styles.cachedGrid}>
            {cachedUsers.map((user) => (
              <Card 
                key={user._id} 
                onClick={() => handleQuickSearch(user.username)}
                className={styles.cachedCard}
                hover
              >
                <div className={styles.cachedInfo}>
                  <img src={user.avatar} alt={user.username} className={styles.cachedAvatar} />
                  <div className={styles.cachedMeta}>
                    <h4 className={styles.cachedName}>{user.name || user.username}</h4>
                    <span className={styles.cachedUsername}>@{user.username}</span>
                  </div>
                </div>
                
                <div className={styles.cachedStats}>
                  <div className={styles.cachedStat}>
                    <FaFolderOpen /> <span>{user.publicRepos} Repos</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteCache(e, user._id, user.username)}
                    className={styles.deleteBtn}
                    title="Delete cached profile"
                    aria-label="Delete cached profile"
                  >
                    <FaTrash />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Feature Grid section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitleCenter}>Dashboard Features</h2>
        <div className={styles.featuresGrid}>
          <Card className={styles.featureCard}>
            <FaUserAlt className={styles.featureIcon} />
            <h4 className={styles.featureTitle}>Full Profile Sync</h4>
            <p className={styles.featureDesc}>Fetches biography, hireable flag, avatars, join dates, and user handles.</p>
          </Card>
          <Card className={styles.featureCard}>
            <FaFolderOpen className={styles.featureIcon} />
            <h4 className={styles.featureTitle}>Repo Inspections</h4>
            <p className={styles.featureDesc}>Drill down into star counts, branching, programming languages, and forks.</p>
          </Card>
          <Card className={styles.featureCard}>
            <FaDatabase className={styles.featureIcon} />
            <h4 className={styles.featureTitle}>MongoDB Caching</h4>
            <p className={styles.featureDesc}>Keeps profiles cached for 24 hours to bypass raw GitHub API rate throttles.</p>
          </Card>
        </div>
      </section>
    </Container>
  );
};

export default Home;
