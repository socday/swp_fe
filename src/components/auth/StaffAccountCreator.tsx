import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, CheckCircle2, XCircle, Briefcase, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildApiUrl, getApiHeaders } from '../../utils/config';
import { Alert, AlertDescription } from '../ui/alert';

interface StaffAccountCreatorProps {
  onClose?: () => void;
}

const STAFF_ACCOUNTS = [
  { name: 'Staff FU FPT', email: 'staff.fu.fpt@example.com', password: 'staffpassword123', campus: 'FU_FPT', role: 'staff' },
  { name: 'Staff NVH', email: 'staff.nvh@example.com', password: 'staffpassword123', campus: 'NVH', role: 'staff' },
];

export function StaffAccountCreator({ onClose }: StaffAccountCreatorProps = {}) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCreateAccounts = async () => {
    setLoading(true);
    setResults([]);

    const apiUrl = buildApiUrl('/api/create-staff-accounts');
    const headers = getApiHeaders();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to create staff accounts');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      setResults([{ success: false, message: 'An error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = (index: number) => {
    const staff = STAFF_ACCOUNTS[index];
    const credentials = `Email: ${staff.email}\nPassword: ${staff.password}`;
    navigator.clipboard.writeText(credentials);
    setCopiedIndex(index);
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Alert className="bg-green-50 border-green-200">
        <Briefcase className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Tạo 2 tài khoản Staff để phê duyệt đơn đặt phòng và quản lý cơ sở vật chất - một cho mỗi campus (FU FPT và NVH)
        </AlertDescription>
      </Alert>

      {/* Staff Accounts List */}
      <div className="grid gap-4 md:grid-cols-2">
        {STAFF_ACCOUNTS.map((staff, index) => (
          <motion.div
            key={staff.email}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full opacity-50" />
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{staff.name}</CardTitle>
                      <CardDescription>{staff.campus === 'FU_FPT' ? 'FU FPT Campus' : 'NVH Campus'}</CardDescription>
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
                    {staff.email}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                    {staff.password}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Staff
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {staff.campus}
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
          className="w-full bg-green-500 hover:bg-green-600 text-white h-12"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <Briefcase className="mr-2 h-5 w-5" />
              Tạo Staff Accounts vào Backend API
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
                <strong>Thành công!</strong> Tất cả tài khoản staff đã được tạo hoặc đã tồn tại. 
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
          <li>Click "Tạo Staff Accounts vào Backend API" để tạo 2 tài khoản staff</li>
          <li>Đợi hệ thống xác nhận tạo thành công</li>
          <li>Copy credentials bằng cách click icon <Copy className="inline h-3 w-3" /></li>
          <li>Đóng dialog và login với email/password ở trên</li>
          <li>Bắt đầu làm việc với quyền Staff (phê duyệt đơn, quản lý lịch, tạo tasks)</li>
        </ol>
      </motion.div>

      {/* Staff Permissions Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-green-50 p-4 rounded-lg border border-green-200"
      >
        <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-green-600" />
          Quyền hạn của Staff:
        </h4>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Xem tất cả đơn đặt phòng (pending, approved, rejected, cancelled)</li>
          <li>Phê duyệt hoặc từ chối đơn đặt phòng</li>
          <li>Hủy lịch đã duyệt và thông báo cho user</li>
          <li>Tự động tạo tasks cho Security khi approve booking</li>
          <li>Xử lý reports từ Security về tình trạng phòng</li>
          <li>Quản lý calendar view của campus</li>
        </ul>
      </motion.div>
    </div>
  );
}