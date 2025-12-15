import { useState } from 'react';
import { authApi } from '../../api/api';

export interface SecurityAccount {
  email: string;
  password: string;
  name: string;
  role: 'security';
  campus: 'FU_FPT' | 'NVH';
}

export const SECURITY_ACCOUNTS: SecurityAccount[] = [
  { 
    email: 'security1@fpt.edu.vn', 
    password: 'security123', 
    name: 'Tran Van H', 
    role: 'security', 
    campus: 'FU_FPT' 
  },
  { 
    email: 'security2@fe.edu.vn', 
    password: 'security123', 
    name: 'Le Thi I', 
    role: 'security', 
    campus: 'NVH' 
  },
];

export interface AccountResult {
  email: string;
  success: boolean;
  message: string;
}

export function useSecurityAccountCreator(accounts: SecurityAccount[]) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AccountResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCreateAccounts = async () => {
    setLoading(true);
    const newResults: AccountResult[] = [];

    for (const security of accounts) {
      try {
        const result = await authApi.register(security);

        if (result.success) {
          newResults.push({
            email: security.email,
            success: true,
            message: `✓ Tạo thành công`,
          });
        } else {
          if (result.error?.includes('already') || result.error?.includes('exists')) {
            newResults.push({
              email: security.email,
              success: true,
              message: `✓ Đã tồn tại (có thể đăng nhập)`,
            });
          } else {
            newResults.push({
              email: security.email,
              success: false,
              message: result.error || 'Không thể tạo tài khoản',
            });
          }
        }
      } catch (error) {
        newResults.push({
          email: security.email,
          success: false,
          message: 'Lỗi kết nối mạng',
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const handleCopyCredentials = (index: number) => {
    const security = accounts[index];
    const text = `Email: ${security.email}\nPassword: ${security.password}`;
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