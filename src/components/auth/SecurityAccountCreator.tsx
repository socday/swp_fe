import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle2, XCircle, Shield, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildApiUrl, getApiHeaders } from '../../utils/config';
import { Alert, AlertDescription } from '../ui/alert';

interface SecurityAccountCreatorProps {
  onClose?: () => void;
}

export function SecurityAccountCreator({ onClose }: SecurityAccountCreatorProps = {}) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const SECURITY_ACCOUNTS = [
    { name: 'Security FU FPT', email: 'security.fu.fpt@example.com', password: 'securepassword123', campus: 'FU_FPT' },
    { name: 'Security NVH', email: 'security.nvh@example.com', password: 'securepassword123', campus: 'NVH' },
  ];

  const handleCreateAccounts = async () => {
    setLoading(true);
    const newResults: { success: boolean; message: string }[] = [];
    for (const security of SECURITY_ACCOUNTS) {
      try {
        const response = await fetch(buildApiUrl('/api/create-security-account'), {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify(security),
        });
        const data = await response.json();
        newResults.push({ success: data.success, message: data.message });
      } catch (error) {
        newResults.push({ success: false, message: 'Đã xảy ra lỗi khi tạo tài khoản' });
      }
    }
    setResults(newResults);
    setLoading(false);
  };

  const handleCopyCredentials = (index: number) => {
    const security = SECURITY_ACCOUNTS[index];
    const credentials = `Email: ${security.email}\nPassword: ${security.password}`;
    navigator.clipboard.writeText(credentials);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Tạo 2 tài khoản Security để giám sát và quản lý cơ sở vật chất - một cho mỗi campus (FU FPT và NVH)
        </AlertDescription>
      </Alert>

      {/* Security Accounts List */}
      <div className="grid gap-4 md:grid-cols-2">
        {SECURITY_ACCOUNTS.map((security, index) => (
          <motion.div
            key={security.email}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50" />
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{security.name}</CardTitle>
                      <CardDescription>{security.campus === 'FU_FPT' ? 'FU FPT Campus' : 'NVH Campus'}</CardDescription>
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
                    {security.email}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {security.password}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Security
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {security.campus}
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
          className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Tạo Security Accounts vào Backend API
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
                <strong>Thành công!</strong> Tất cả tài khoản security đã được tạo hoặc đã tồn tại. 
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
          <li>Click "Tạo Security Accounts vào Backend API" để tạo 2 tài khoản security</li>
          <li>Đợi hệ thống xác nhận tạo thành công</li>
          <li>Copy credentials bằng cách click icon <Copy className="inline h-3 w-3" /></li>
          <li>Đóng dialog và login với email/password ở trên</li>
          <li>Bắt đầu làm việc với quyền Security (xem lịch đã duyệt, nhận tasks, báo cáo)</li>
        </ol>
      </motion.div>

      {/* Security Permissions Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 p-4 rounded-lg border border-blue-200"
      >
        <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          Quyền hạn của Security:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Xem lịch đặt phòng đã được duyệt</li>
          <li>Nhận tasks mở cửa phòng từ Staff</li>
          <li>Gửi báo cáo tình trạng phòng (damage reports)</li>
          <li>Cập nhật trạng thái hoàn thành task</li>
          <li>Xem thông tin chi tiết phòng và booking</li>
        </ul>
      </motion.div>
    </div>
  );
}