import React from 'react';
import styles from './DeliveryStatus.module.css';
import { useUserLocation } from '../../context/LocationContext';

const DeliveryStatus = ({ onClick }) => {
  const { location, isDetecting, detectLocation } = useUserLocation();

  const handleClick = () => {
    // If location failed or is default, try detecting again
    if (location === 'Select your address' || 
        location === 'Location unavailable' || 
        location === 'Unable to detect location' ||
        location === 'Location access denied') {
      detectLocation();
    }
    
    // Also trigger the modal
    if (onClick) {
      onClick();
    }
  };

  // Show different states
  const isError = location?.includes('denied') || 
                  location?.includes('unavailable') || 
                  location?.includes('Unable');
  
  const isDefault = location === 'Select your address';

  return (
    <div 
      className={`${styles.container} ${isError ? styles.error : ''}`} 
      onClick={handleClick}
      title={isError ? "Click to retry" : "Click to change location"}
    >
      <div className={styles.iconSection}>
        <img src="/icons/icons-position.png" alt="location" />
      </div>
      <div className={styles.textSection}>
        <span className={styles.label}>Deliver to</span>
        {isDetecting ? (
          <div className={styles.skeleton}></div>
        ) : (
          <span className={`${styles.location} ${isError ? styles.errorText : ''}`}>
            {location || 'Select your address'}
            {isError && <span className={styles.retryHint}> (tap to retry)</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default DeliveryStatus;