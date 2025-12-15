import { useState } from 'react';
import { authApi } from '../../api/api';

export interface StaffAccount {
  email: string;
  password: string;
  name: string;
  role: 'staff';
  campus: 'FU_FPT' | 'NVH';
}

export const STAFF_ACCOUNTS: StaffAccount[] = [
  { 
    email: 'staff1@fpt.edu.vn', 
    password: 'staff123', 
    name: 'Nguyen Van S', 
    role: 'staff', 
    campus: 'FU_FPT' 
  },
  { 
    email: 'staff2@fe.edu.vn', 
    password: 'staff123', 
    name: 'Le Thi T', 
    role: 'staff', 
    campus: 'NVH' 
  },
];

export interface AccountResult {
  email: string;
  success: boolean;
  message: string;
}

export function useStaffAccountCreator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AccountResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCreateAccounts = async () => {
    setLoading(true);
    const newResults: AccountResult[] = [];

    for (const staff of STAFF_ACCOUNTS) {
      try {
        const result = await authApi.register(staff);

        if (result.success) {
          newResults.push({
            email: staff.email,
            success: true,
            message: `✓ Tạo thành công`,
          });
        } else {
          // Check if user already exists
          if (result.error?.includes('already') || result.error?.includes('exists')) {
            newResults.push({
              email: staff.email,
              success: true,
              message: `✓ Đã tồn tại (có thể đăng nhập)`,
            });
          } else {
            newResults.push({
              email: staff.email,
              success: false,
              message: result.error || 'Không thể tạo tài khoản',
            });
          }
        }
      } catch (error: any) {
        newResults.push({
          email: staff.email,
          success: false,
          message: 'Lỗi kết nối mạng',
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const handleCopyCredentials = (index: number) => {
    const staff = STAFF_ACCOUNTS[index];
    const text = `Email: ${staff.email}\nPassword: ${staff.password}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return {
    loading,
    results,
    copiedIndex,
    handleCreateAccounts,
    handleCopyCredentials,
  };
}