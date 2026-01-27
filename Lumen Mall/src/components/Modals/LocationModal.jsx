import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import styles from './LocationModal.module.css';

const LocationModal = ({ isOpen, onClose }) => {
  const { setLocation } = useLocation();
  const [tempLocation, setTempLocation] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAutoDetect = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Setting coordinates as the location string
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          setLoading(false);
          onClose();
        },
        (error) => {
          alert("Location access denied. Please enter it manually.");
          setLoading(false);
        }
      );
    }
  };

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
        
        <button 
          type="button" 
          onClick={handleAutoDetect} 
          className={styles.detectBtn}
          disabled={loading}
        >
          {loading ? "Detecting..." : "📍 Use my current location"}
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
          <button type="submit" className={styles.applyBtn}>Apply</button>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;