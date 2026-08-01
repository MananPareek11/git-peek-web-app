import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useGithubUser } from '../hooks/useGithubUser';
import { useRepositories } from '../hooks/useRepositories';
import { usePagination } from '../hooks/usePagination';
import Container from '../components/layout/Container';
import ProfileCard from '../components/profile/ProfileCard';
import UserStats from '../components/profile/UserStats';
import RepoFilter from '../components/repository/RepoFilter';
import RepoSort from '../components/repository/RepoSort';
import RepoList from '../components/repository/RepoList';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import ExportPdfButton from '../components/profile/ExportPdfButton';
import { ProfileSkeleton, ReposGridSkeleton } from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import styles from './Profile.module.css';

export const Profile = () => {
  const { username } = useParams();
  
  const {
    userData,
    reposData,
    loading,
    refreshing,
    error,
    source,
    forceRefresh,
  } = useGithubUser(username);

  // Hook to handle client-side sorting, searching, and filtering
  const {
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    languages,
    filteredRepos,
    totalItems,
    totalPages,
    itemsPerPage,
  } = useRepositories(reposData);

  // Hook to compute the pagination range array (e.g. [1, '...', 5, 6])
  const { paginationRange } = usePagination(totalItems, itemsPerPage, currentPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll smoothly to repository header
    const element = document.getElementById('repos-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRetry = () => {
    forceRefresh();
  };

  // Rendering Loading Skeletons
  if (loading && !refreshing) {
    return (
      <Container className={styles.profileContainer}>
        <div className={styles.backRow}>
          <SkeletonBackButton />
        </div>
        <div className={styles.dashboardLayout}>
          <aside className={styles.sidebar}>
            <ProfileSkeleton />
          </aside>
          <main className={styles.mainContent}>
            <div className={styles.skeletonStatsGrid}>
              <div className="shimmer-bg" style={{ height: '80px', borderRadius: '12px' }} />
              <div className="shimmer-bg" style={{ height: '80px', borderRadius: '12px' }} />
              <div className="shimmer-bg" style={{ height: '80px', borderRadius: '12px' }} />
              <div className="shimmer-bg" style={{ height: '80px', borderRadius: '12px' }} />
            </div>
            <div className={styles.skeletonFilterRow} />
            <ReposGridSkeleton count={6} />
          </main>
        </div>
      </Container>
    );
  }

  // Rendering Errors
  if (error) {
    return (
      <Container className={styles.centerContainer}>
        <div className={styles.backRow}>
          <Link to="/">
            <Button variant="secondary" icon={FaArrowLeft}>
              Back to Search
            </Button>
          </Link>
        </div>
        <ErrorState 
          title="Profile Search Failed"
          message={error}
          onRetry={handleRetry}
          retryLabel="Retry Profile Search"
        />
      </Container>
    );
  }

  if (!userData) return null;

  return (
    <Container className={`${styles.profileContainer} animate-fade-in`}>
      {/* Top Header Row with back button & export PDF button */}
      <div className={styles.backRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/">
          <Button variant="secondary" icon={FaArrowLeft} size="sm">
            Back to Search
          </Button>
        </Link>
        <ExportPdfButton userData={userData} reposData={reposData} />
      </div>

      {/* Main Dashboard Layout Grid */}
      <div className={styles.dashboardLayout}>
        {/* Left Side: Developer Info */}
        <aside className={styles.sidebar}>
          <ProfileCard
            user={userData}
            onRefresh={forceRefresh}
            refreshing={refreshing}
            source={source}
          />
        </aside>

        {/* Right Side: Repositories list & stats */}
        <main className={styles.mainContent}>
          <UserStats user={userData} />

          {/* Repository Section Wrapper */}
          <section id="repos-section" className={styles.reposSection}>
            <div className={styles.reposHeader}>
              <div className={styles.titleRow}>
                <h3 className={styles.sectionTitle}>Public Repositories</h3>
                <span className={styles.repoCountBadge}>
                  {totalItems} match{totalItems !== 1 ? 'es' : ''}
                </span>
              </div>
              <RepoSort sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Filter controls bar */}
            <div className={styles.filterControls}>
              <RepoFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                languages={languages}
              />
            </div>

            {/* Repos Grid */}
            <div className={styles.reposListContainer}>
              {refreshing && <div className={styles.refreshOverlay}>Syncing repos...</div>}
              <RepoList repos={filteredRepos} />
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              paginationRange={paginationRange}
            />
          </section>
        </main>
      </div>
    </Container>
  );
};

const SkeletonBackButton = () => (
  <div className="shimmer-bg" style={{ width: '130px', height: '38px', borderRadius: '8px' }} />
);

export default Profile;
