import { useState, useEffect } from 'react';
import { checkBackendHealth, API_BASE_URL } from '../../utils/config';
import { Wifi, WifiOff } from 'lucide-react';

export function BackendStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check connection every 30 seconds
    const interval = setInterval(async () => {
      const health = await checkBackendHealth();
      setIsConnected(health.isReachable);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!showDetails) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className={`fixed bottom-4 right-4 p-2 rounded-full shadow-lg transition-colors ${
          isConnected 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-red-500 hover:bg-red-600 animate-pulse'
        }`}
        title={isConnected ? 'Backend Connected' : 'Backend Disconnected'}
      >
        {isConnected ? (
          <Wifi className="w-5 h-5 text-white" />
        ) : (
          <WifiOff className="w-5 h-5 text-white" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className="font-semibold">Backend Status</span>
        </div>
        <button
          onClick={() => setShowDetails(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="flex items-start justify-between">
          <span className="text-gray-600">URL:</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded ml-2 break-all">
            {API_BASE_URL}
          </code>
        </div>
      </div>
    </div>
  );
}
