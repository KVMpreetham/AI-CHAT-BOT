import React from 'react';
import { FaRobot, FaUserAlt } from 'react-icons/fa';
import styles from './Avatar.module.css';

export const Avatar = ({ isBot }) => {
  return (
    <div className={`${styles.avatarContainer} ${isBot ? styles.botAvatar : styles.userAvatar}`}>
      {isBot ? (
        <div className={styles.botIconWrapper}>
          <FaRobot className={styles.icon} />
          <span className={styles.statusIndicator}></span>
        </div>
      ) : (
        <div className={styles.userIconWrapper}>
          <FaUserAlt className={styles.icon} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
