import React from 'react';
import { FaBars, FaRobot, FaPalette, FaChartBar, FaCommentAlt } from 'react-icons/fa';
import styles from './Header.module.css';

export const Header = ({
  theme,
  setTheme,
  currentView,
  setCurrentView,
  setMobileSidebarOpen
}) => {
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'blue' : 'dark';
    setTheme(nextTheme);
  };

  const handleToggleView = () => {
    setCurrentView(currentView === 'chat' ? 'admin' : 'chat');
  };

  return (
    <header className={styles.header}>
      {/* Mobile Hamburger menu */}
      <button
        className={styles.menuButton}
        onClick={() => setMobileSidebarOpen(true)}
        title="Open Sidebar"
      >
        <FaBars />
      </button>

      {/* Brand logo & title */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>
          <FaRobot />
        </div>
        <div className={styles.brandText}>
          <h1 className={styles.title}>SupportAI</h1>
          <div className={styles.statusWrapper}>
            <span className={styles.statusDot}></span>
            <span className={styles.statusText}>Agent Online</span>
          </div>
        </div>
      </div>

      {/* Action controls */}
      <div className={styles.controls}>
        {/* Theme Switcher Button */}
        <button
          className={styles.controlButton}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Blue' : 'Dark'} Theme`}
        >
          <FaPalette />
          <span className={styles.btnText}>Theme</span>
        </button>

        {/* View Switcher Button (Chat <=> Admin) */}
        <button
          className={`${styles.controlButton} ${styles.primaryBtn}`}
          onClick={handleToggleView}
          title={currentView === 'chat' ? 'Open Admin Panel' : 'Return to Chat'}
        >
          {currentView === 'chat' ? (
            <>
              <FaChartBar />
              <span>Admin Panel</span>
            </>
          ) : (
            <>
              <FaCommentAlt />
              <span>Go to Chat</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
