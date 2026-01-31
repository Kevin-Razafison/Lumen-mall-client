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
    
    // Only auto-detect if user is authenticated and hasn't set a location
    if (hasDefaultLocation && isAuthenticated) {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectLocation = () => {
    setIsDetecting(true);

    if (!navigator.geolocation) {
      setLocation("Location not supported");
      localStorage.setItem('lumenLocation', "Location not supported");
      setIsDetecting(false);
      return;
    }

    // Timeout handler - if geolocation takes too long, show fallback
    const timeoutId = setTimeout(() => {
      console.warn('Geolocation timeout - using IP-based location');
      fetchLocationByIP();
    }, 8000); // 8 second timeout

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        try {
          // Try primary geocoding service
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { timeout: 5000 }
          );
          
          const data = await res.json();
          const detectedLocation = data.city || data.principalSubdivision || "Location Found";
          
          setLocation(detectedLocation);
          localStorage.setItem('lumenLocation', detectedLocation);
          setIsDetecting(false);
        } catch (err) {
          console.error('Geocoding error:', err);
          // Fallback to coordinates
          const fallbackLocation = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
          setLocation(fallbackLocation);
          localStorage.setItem('lumenLocation', fallbackLocation);
          setIsDetecting(false);
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        console.error("Geolocation Error:", error);
        
        // Handle different error types
        let errorLocation = "Location unavailable";
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorLocation = "Location access denied";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorLocation = "Position unavailable";
            break;
          case 3: // TIMEOUT
            console.log('Position timeout - trying IP fallback');
            fetchLocationByIP();
            return; // Don't set error location yet, try IP first
          default:
            errorLocation = "Location error";
        }
        
        setLocation(errorLocation);
        localStorage.setItem('lumenLocation', errorLocation);
        setIsDetecting(false);
      },
      { 
        enableHighAccuracy: false, // Faster but less accurate
        timeout: 7000, // 7 seconds
        maximumAge: 300000 // Accept cached position up to 5 min old
      }
    );
  };

  // Fallback: Use IP-based geolocation
  const fetchLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 5000
      });
      
      const data = await response.json();
      
      if (data.city && data.region) {
        const ipLocation = `${data.city}, ${data.region}`;
        setLocation(ipLocation);
        localStorage.setItem('lumenLocation', ipLocation);
      } else if (data.country_name) {
        setLocation(data.country_name);
        localStorage.setItem('lumenLocation', data.country_name);
      } else {
        setLocation("Location detected");
        localStorage.setItem('lumenLocation', "Location detected");
      }
    } catch (err) {
      console.error('IP geolocation failed:', err);
      setLocation("Unable to detect location");
      localStorage.setItem('lumenLocation', "Unable to detect location");
    } finally {
      setIsDetecting(false);
    }
  };

  // Manual update function
  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    localStorage.setItem('lumenLocation', newLocation);
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      setLocation: updateLocation, 
      isDetecting, 
      setIsDetecting, 
      detectLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within LocationProvider');
  }
  return context;
};