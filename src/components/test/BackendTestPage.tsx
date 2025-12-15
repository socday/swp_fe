import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { authApi, campusesApi, facilitiesApi, slotsApi, bookingsApi } from '../../api/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export function BackendTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (name: string, updates: Partial<TestResult>) => {
    setResults(prev => 
      prev.map(r => r.name === name ? { ...r, ...updates } : r)
    );
  };

  const testLogin = async () => {
    const testName = 'Login';
    addResult({ name: testName, status: 'pending' });
    
    try {
      const result = await authApi.login({ email, password });
      
      if (result.success && result.user) {
        updateResult(testName, {
          status: 'success',
          message: `Logged in as ${result.user.fullName} (${result.user.role?.roleName})`,
          data: result.user,
        });
        
        // Store token for subsequent tests
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        
        return true;
      } else {
        updateResult(testName, {
          status: 'error',
          message: result.error || 'Login failed',
        });
        return false;
      }
    } catch (error: any) {
      updateResult(testName, {
        status: 'error',
        message: error.message,
      });
      return false;
    }
  };

  const testCampuses = async () => {
    const testName = 'Get Campuses';
    addResult({ name: testName, status: 'pending' });
    
    try {
      const campuses = await campusesApi.getAll();
      updateResult(testName, {
        status: 'success',
        message: `Found ${campuses.length} campuses`,
        data: campuses,
      });
    } catch (error: any) {
      updateResult(testName, {
        status: 'error',
        message: error.message,
      });
    }
  };

  const testFacilities = async () => {
    const testName = 'Get Facilities';
    addResult({ name: testName, status: 'pending' });
    
    try {
      const facilities = await facilitiesApi.getAll();
      updateResult(testName, {
        status: 'success',
        message: `Found ${facilities.length} facilities`,
        data: facilities.slice(0, 3), // Only show first 3
      });
    } catch (error: any) {
      updateResult(testName, {
        status: 'error',
        message: error.message,
      });
    }
  };

  const testSlots = async () => {
    const testName = 'Get Slots';
    addResult({ name: testName, status: 'pending' });
    
    try {
      const slots = await slotsApi.getAll();
      updateResult(testName, {
        status: 'success',
        message: `Found ${slots.length} time slots`,
        data: slots,
      });
    } catch (error: any) {
      updateResult(testName, {
        status: 'error',
        message: error.message,
      });
    }
  };

  const testBookings = async () => {
    const testName = 'Get Bookings';
    addResult({ name: testName, status: 'pending' });
    
    try {
      const bookings = await bookingsApi.getAll();
      updateResult(testName, {
        status: 'success',
        message: `Found ${bookings.length} bookings`,
        data: bookings.slice(0, 3), // Only show first 3
      });
    } catch (error: any) {
      updateResult(testName, {
        status: 'error',
        message: error.message,
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    // Test login first
    const loginSuccess = await testLogin();
    
    if (loginSuccess) {
      // Run other tests if login succeeds
      await testCampuses();
      await testFacilities();
      await testSlots();
      await testBookings();
    }
    
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend API Connection Test</CardTitle>
            <CardDescription>
              Test the connection to your FPT Booking Backend API at http://localhost:5000/api
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={testing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-password">Password</Label>
              <Input
                id="test-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={testing}
              />
            </div>

            <Button 
              onClick={runAllTests} 
              disabled={testing || !email || !password}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {result.status === 'pending' && (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        )}
                        {result.status === 'success' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {result.status === 'error' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">{result.name}</span>
                      </div>
                    </div>
                    
                    {result.message && (
                      <p className={`mt-2 text-sm ${
                        result.status === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {result.message}
                      </p>
                    )}
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-64">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
