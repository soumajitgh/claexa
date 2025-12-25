import { useEffect, useState } from 'react';

// Breakpoints (can be centralized if desired)
const MOBILE_MAX = 767; // <768
const TABLET_MAX = 1024; // <=1024 treat as tablet

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  initialized: boolean; // indicates we have computed at least once on client
}

function computeInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    // SSR / pre-hydration safe defaults (avoid claiming desktop decisively)
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 0,
      height: 0,
      initialized: false,
    };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width <= MOBILE_MAX;
  const isTablet = !isMobile && width <= TABLET_MAX;
  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    width,
    height,
    initialized: true,
  };
}

export function useDeviceBreakpoint(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(() => computeInfo());

  useEffect(() => {
    const handle = () => setInfo(computeInfo());
    // Run once (in case initial was SSR placeholder)
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return info;
}
