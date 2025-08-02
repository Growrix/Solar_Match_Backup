import { useState, useEffect } from 'react';
import { getDatabaseStatus } from '@/lib/utils/database';

interface DatabaseStatus {
  connected: boolean;
  error?: string;
  timestamp: string;
  loading: boolean;
}

export const useDatabase = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    connected: false,
    loading: true,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const dbStatus = await getDatabaseStatus();
        setStatus({
          ...dbStatus,
          loading: false
        });
      } catch (error) {
        setStatus({
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          loading: false
        });
      }
    };

    // Initial check
    checkStatus();

    // Periodic status check every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return status;
};