import React, { useState, useEffect } from 'react';
import DesktopHeader from './DesktopHeader'
import MobileHeader from './mobile/MobileHeader';
import { useUserLocation } from '../../context/LocationContext';

const Header = ({ openLocationModal }) => {
  const { location } = useUserLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? (
    <MobileHeader openLocationModal={openLocationModal} location={location} />
  ) : (
    <DesktopHeader openLocationModal={openLocationModal} />
  );
};

export default Header;