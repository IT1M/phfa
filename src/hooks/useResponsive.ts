import { useState, useEffect } from 'react';

export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useResponsive() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);

      if (w < BREAKPOINTS.tablet) {
        setDeviceType('mobile');
      } else if (w < BREAKPOINTS.desktop) {
        setDeviceType('tablet');
      } else if (w < BREAKPOINTS.wide) {
        setDeviceType('desktop');
      } else {
        setDeviceType('wide');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    deviceType,
    width,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop' || deviceType === 'wide',
    isTouchDevice: 'ontouchstart' in window,
  };
}
