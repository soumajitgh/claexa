import { useEffect, useState } from 'react';

/**
 * Custom hook to track online/offline network status
 * Primarily used in mobile views to display offline screen when connection is lost
 * @returns boolean indicating if the device is currently online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // Initialize with current online status
    // Defaults to true if navigator.onLine is not available (server-side)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Handler to set online status
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Handler to set offline status
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check (in case status changed before listeners were added)
    setIsOnline(navigator.onLine);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
