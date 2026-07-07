import React from 'react';
import styles from './TypingIndicator.module.css';

export const TypingIndicator = () => {
  return (
    <div className={styles.indicatorContainer}>
      <span className={styles.dot}></span>
      <span className={styles.dot}></span>
      <span className={styles.dot}></span>
    </div>
  );
};

export default TypingIndicator;
