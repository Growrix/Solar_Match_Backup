import React from 'react';
import { Database, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';

const DatabaseStatus: React.FC = () => {
  const { connected, error, loading, timestamp } = useDatabase();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-battleship_gray-600">
        <Loader className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking database...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {connected ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-400">Database Connected</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-400">Database Error</span>
          {error && (
            <span className="text-xs text-battleship_gray-600">({error})</span>
          )}
        </>
      )}
      <Database className="h-4 w-4 text-battleship_gray-600" />
    </div>
  );
};

export default DatabaseStatus;