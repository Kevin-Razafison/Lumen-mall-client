import React, { useState } from 'react';
import { useUserLocation } from '../../context/LocationContext';
import styles from './LocationModal.module.css';

const LocationModal = ({ isOpen, onClose }) => {
  const { setLocation, detectLocation, isDetecting } = useUserLocation();
  const [tempLocation, setTempLocation] = useState('');

  if (!isOpen) return null;

  const handleAutoDetect = async () => {
    await detectLocation();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempLocation.trim()) {
      setLocation(tempLocation.trim());
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Choose your location</h3>
        <p>Delivery options and speeds may vary for different locations.</p>

        <button
          type="button"
          onClick={handleAutoDetect}
          className={styles.detectBtn}
          disabled={isDetecting}
        >
          {isDetecting ? 'Detecting...' : '📍 Use my current location'}
        </button>

        <div className={styles.separator}>or enter manually</div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter city or zip code"
            value={tempLocation}
            onChange={(e) => setTempLocation(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.applyBtn}>
            Apply
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
