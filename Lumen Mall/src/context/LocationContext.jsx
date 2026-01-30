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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          const detectedLocation = data.city || data.principalSubdivision || "Location Found";
          setLocation(detectedLocation);
          localStorage.setItem('lumenLocation', detectedLocation);
        } catch (err) {
          // FIXED: Added parentheses here
          const fallbackLocation = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocation(fallbackLocation);
          localStorage.setItem('lumenLocation', fallbackLocation);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geo Error:", error);
        let errorLocation = "Location Unavailable";
        if (error.code === 1) errorLocation = "Location Denied";
        else if (error.code === 2) errorLocation = "Location Unavailable";
        else errorLocation = "Timeout";
        setLocation(errorLocation);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isDetecting, setIsDetecting, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(LocationContext);