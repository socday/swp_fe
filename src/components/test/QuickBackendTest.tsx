import { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export function QuickBackendTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    endpoint: string;
    status: 'success' | 'error' | 'testing';
    message: string;
    data?: any;
  }[]>([]);

  const testEndpoints = [
    { name: 'Campuses', url: 'http://localhost:5227/api/Campuses' },
    { name: 'Facilities', url: 'http://localhost:5227/api/Facilities' },
    { name: 'Slots', url: 'http://localhost:5227/api/Slots' },
  ];

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    for (const endpoint of testEndpoints) {
      setResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'testing',
        message: 'Testing...'
      }]);

      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setResults(prev => prev.map(r => 
            r.endpoint === endpoint.name 
              ? { 
                  ...r, 
                  status: 'success', 
                  message: `✅ Success! (${response.status})`,
                  data: Array.isArray(data) ? `${data.length} items` : 'Object received'
                }
              : r
          ));
        } else {
          setResults(prev => prev.map(r => 
            r.endpoint === endpoint.name 
              ? { ...r, status: 'error', message: `❌ HTTP ${response.status}: ${response.statusText}` }
              : r
          ));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setResults(prev => prev.map(r => 
          r.endpoint === endpoint.name 
            ? { ...r, status: 'error', message: `❌ ${errorMsg}` }
            : r
        ));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 w-96 z-50">
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-2">🔧 Backend Connection Test</h3>
        <p className="text-sm text-gray-600 mb-3">
          Testing direct API calls to backend endpoints
        </p>
        
        <button
          onClick={runTests}
          disabled={testing}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">RESULTS:</p>
            {results.map((result, idx) => (
              <div key={idx} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center gap-2 mb-1">
                  {result.status === 'testing' && <Loader className="w-4 h-4 animate-spin text-blue-500" />}
                  {result.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {result.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="font-medium">{result.endpoint}</span>
                </div>
                <p className="text-xs text-gray-600 ml-6">{result.message}</p>
                {result.data && (
                  <p className="text-xs text-blue-600 ml-6">Data: {result.data}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t text-xs text-gray-500">
        <p><strong>If you see CORS errors:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Open your backend <code className="bg-gray-100 px-1">Program.cs</code></li>
          <li>Add CORS configuration (see BACKEND_SETUP.md)</li>
          <li>Restart backend and test again</li>
        </ol>
      </div>
    </div>
  );
}
