import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildApiUrl, getApiHeaders } from '../../utils/config';

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'lecturer' | 'admin';
  campus: 'FU_FPT' | 'NVH';
}

const DEMO_USERS: DemoUser[] = [
  { email: 'student1@fpt.edu.vn', password: 'student123', name: 'Nguyen Van A', role: 'student', campus: 'FU_FPT' },
  { email: 'student2@fpt.edu.vn', password: 'student123', name: 'Tran Thi B', role: 'student', campus: 'NVH' },
  { email: 'student3@fpt.edu.vn', password: 'student123', name: 'Le Van C', role: 'student', campus: 'FU_FPT' },
  { email: 'lecturer1@fpt.edu.vn', password: 'lecturer123', name: 'Dr. Pham Minh D', role: 'lecturer', campus: 'FU_FPT' },
  { email: 'lecturer2@fe.edu.vn', password: 'lecturer123', name: 'Dr. Hoang Thi E', role: 'lecturer', campus: 'NVH' },
  { email: 'admin1@fpt.edu.vn', password: 'admin123', name: 'Vo Van F', role: 'admin', campus: 'FU_FPT' },
  { email: 'admin2@fe.edu.vn', password: 'admin123', name: 'Nguyen Thi G', role: 'admin', campus: 'NVH' },
];

interface UserInitializerProps {
  onClose: () => void;
}

export function UserInitializer({ onClose }: UserInitializerProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ email: string; success: boolean; message: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    setShowResults(false);
    const newResults: { email: string; success: boolean; message: string }[] = [];

    for (const user of DEMO_USERS) {
      try {
        const response = await fetch(buildApiUrl('/signup'), {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(user),
        });

        const data = await response.json();

        if (response.ok) {
          newResults.push({
            email: user.email,
            success: true,
            message: `Created ${user.role}`,
          });
        } else {
          newResults.push({
            email: user.email,
            success: false,
            message: data.error || 'Failed to create',
          });
        }
      } catch (error: any) {
        newResults.push({
          email: user.email,
          success: false,
          message: 'Network error',
        });
      }
    }

    setResults(newResults);
    setShowResults(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Initialize Demo Users
            </CardTitle>
            <CardDescription>
              Create demo accounts for testing the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showResults ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    This will create {DEMO_USERS.length} demo user accounts:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• 3 Students (password: student123)</li>
                    <li>• 2 Lecturers (password: lecturer123)</li>
                    <li>• 2 Admins (password: admin123)</li>
                  </ul>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Campus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DEMO_USERS.map((user, index) => (
                        <motion.tr
                          key={user.email}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-t"
                        >
                          <td className="p-2">{user.email}</td>
                          <td className="p-2 capitalize">{user.role}</td>
                          <td className="p-2">{user.campus === 'FU_FPT' ? 'FU FPT' : 'NVH'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleInitialize}
                      disabled={loading}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Users...
                        </>
                      ) : (
                        <>
                          <Users className="mr-2 h-4 w-4" />
                          Create Demo Users
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.success ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{result.email}</span>
                        </div>
                        <span className={`text-xs ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.message}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    Successfully created: {results.filter(r => r.success).length} / {results.length}
                  </p>
                  {results.some(r => !r.success && r.message.includes('already')) && (
                    <p className="text-xs text-gray-600">
                      Note: Some accounts may already exist in the system
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600">
                      Done
                    </Button>
                  </motion.div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}