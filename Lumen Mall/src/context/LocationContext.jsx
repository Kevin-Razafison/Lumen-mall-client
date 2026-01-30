import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('lumenLocation') || 'Select your address';
  });
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const hasDefaultLocation = location === 'Select your address';
    const isAuthenticated = !!localStorage.getItem('lumenToken');

    if (hasDefaultLocation && isAuthenticated) {
      detectLocation();
    }
  }, []);

  const detectLocation = () => {
    setIsDetecting(true);

    if (!navigator.geolocation) {
      setLocation("Not supported");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          setLocation(data.city || data.principalSubdivision || "Location Found");
        } catch (err) {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geo Error:", error);
        if (error.code === 1) setLocation("Location Denied");
        else if (error.code === 2) setLocation("Location Unavailable");
        else setLocation("Timeout");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isDetecting, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(LocationContext);