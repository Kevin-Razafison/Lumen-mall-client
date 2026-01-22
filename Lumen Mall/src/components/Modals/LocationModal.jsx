import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import styles from './LocationModal.module.css';

const LocationModal = ({ isOpen, onClose }) => {
  const { setLocation } = useLocation();
  const [tempLocation, setTempLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempLocation.trim()) {
      setLocation(tempLocation);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Choose your location</h3>
        <p>Delivery options and speeds may vary for different locations.</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter city or zip code" 
            value={tempLocation}
            onChange={(e) => setTempLocation(e.target.value)}
            autoFocus
          />
          <button type="submit">Apply</button>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;