import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle2, XCircle, UserCog, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildApiUrl, getApiHeaders } from '../../utils/config';
import { Alert, AlertDescription } from '../ui/alert';

interface AdminAccount {
  email: string;
  password: string;
  name: string;
  role: 'admin';
  campus: 'FU_FPT' | 'NVH';
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  { 
    email: 'admin1@fpt.edu.vn', 
    password: 'admin123', 
    name: 'Vo Van F', 
    role: 'admin', 
    campus: 'FU_FPT' 
  },
  { 
    email: 'admin2@fe.edu.vn', 
    password: 'admin123', 
    name: 'Nguyen Thi G', 
    role: 'admin', 
    campus: 'NVH' 
  },
];

interface AdminAccountCreatorProps {
  onClose?: () => void;
}

export function AdminAccountCreator({ onClose }: AdminAccountCreatorProps = {}) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ email: string; success: boolean; message: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCreateAccounts = async () => {
    setLoading(true);
    const newResults: { email: string; success: boolean; message: string }[] = [];

    for (const admin of ADMIN_ACCOUNTS) {
      try {
        const response = await fetch(buildApiUrl('/signup'), {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(admin),
        });

        const data = await response.json();

        if (response.ok) {
          newResults.push({
            email: admin.email,
            success: true,
            message: `✓ Created successfully`,
          });
        } else {
          // Check if user already exists
          if (data.error?.includes('already') || data.error?.includes('exists')) {
            newResults.push({
              email: admin.email,
              success: true,
              message: `✓ Already exists (can login)`,
            });
          } else {
            newResults.push({
              email: admin.email,
              success: false,
              message: data.error || 'Failed to create',
            });
          }
        }
      } catch (error: any) {
        newResults.push({
          email: admin.email,
          success: false,
          message: 'Network error',
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const handleCopyCredentials = (index: number) => {
    const admin = ADMIN_ACCOUNTS[index];
    const text = `Email: ${admin.email}\nPassword: ${admin.password}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="bg-orange-50 border-orange-200">
        <UserCog className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Tạo 2 tài khoản Admin để quản lý hệ thống - một cho mỗi campus (FU FPT và NVH)
        </AlertDescription>
      </Alert>

      {/* Admin Accounts List */}
      <div className="grid gap-4 md:grid-cols-2">
        {ADMIN_ACCOUNTS.map((admin, index) => (
          <motion.div
            key={admin.email}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full opacity-50" />
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <UserCog className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{admin.name}</CardTitle>
                      <CardDescription>{admin.campus === 'FU_FPT' ? 'FU FPT Campus' : 'NVH Campus'}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCredentials(index)}
                    className="relative"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {admin.email}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {admin.password}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                      Admin
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {admin.campus}
                    </span>
                  </div>
                </div>

                {/* Result Status */}
                <AnimatePresence>
                  {results.length > 0 && results[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2"
                    >
                      <div className={`flex items-center gap-2 text-sm p-2 rounded ${
                        results[index].success 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {results[index].success ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{results[index].message}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleCreateAccounts}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <UserCog className="mr-2 h-5 w-5" />
              Tạo Admin Accounts vào Backend API
            </>
          )}
        </Button>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {results.length > 0 && results.every(r => r.success) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Thành công!</strong> Tất cả tài khoản admin đã được tạo hoặc đã tồn tại. 
                Bạn có thể đóng dialog này và login với credentials ở trên.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 p-4 rounded-lg border"
      >
        <h4 className="font-semibold mb-2 text-sm">📝 Hướng dẫn:</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Click "Tạo Admin Accounts vào Backend API" để tạo 2 tài khoản admin</li>
          <li>Đợi hệ thống xác nhận tạo thành công</li>
          <li>Copy credentials bằng cách click icon <Copy className="inline h-3 w-3" /></li>
          <li>Đóng dialog và login với email/password ở trên</li>
          <li>Bắt đầu quản lý hệ thống với quyền Admin</li>
        </ol>
      </motion.div>
    </div>
  );
}