import { useEffect, useState } from 'react';
import { checkBackendHealth } from '../../utils/config';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { QuickBackendTest } from '../test/QuickBackendTest';

interface DataInitializerProps {
  children: React.ReactNode;
}

export function DataInitializer({ children }: DataInitializerProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<{ url: string; error?: string } | null>(null);
  const [showTest, setShowTest] = useState(false);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorDetails(null);
    
    const health = await checkBackendHealth();
    
    if (health.isReachable) {
      setStatus('connected');
    } else {
      setStatus('error');
      setErrorDetails({ url: health.url, error: health.error });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Backend Connection Failed</h2>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-600">
                Could not connect to the backend API. Please ensure:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 ml-2">
                <li>Backend server is running at: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{errorDetails?.url}</code></li>
                <li>CORS is enabled on the backend</li>
                <li>Network connection is active</li>
              </ul>
              
              {errorDetails?.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {errorDetails.error}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={checkConnection}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>

              <button
                onClick={() => setShowTest(!showTest)}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showTest ? 'Hide' : 'Show'} Diagnostic Test
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Start your backend server using <code className="bg-blue-100 px-1 rounded">dotnet run</code> in the FPT_Booking_BE directory.
              </p>
            </div>
          </div>
        </div>
        
        {showTest && <QuickBackendTest />}
      </>
    );
  }

  return <>{children}</>;
}