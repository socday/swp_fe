import { useState } from 'react';
import { User } from '../../App';
import { jwtDecode } from 'jwt-decode';
import type { User as BackendUser } from '../../api/api';
import authController from '../../api/api/controllers/authController';

interface DecodedToken {
  userId?: number | string;
  UserId?: number | string;
  sub?: string;
  email?: string;
  Email?: string;
  fullName?: string;
  FullName?: string;
  role?: string;
  Role?: string;
  roleName?: string;
  RoleName?: string;
}

const toNumericId = (value?: string | number): number | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const parsed = parseInt(value as string, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const resolveRole = (role?: string): User['role'] => {
  const normalized = (role || 'student').toLowerCase();
  return ['student', 'lecturer', 'admin', 'staff', 'security'].includes(normalized)
    ? (normalized as User['role'])
    : null;
};

interface UseLoginProps {
  onLogin: (user: User) => void;
}

export function useLogin({ onLogin }: UseLoginProps) {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dialog states
  const [showInitializer, setShowInitializer] = useState(false);
  const [showAdminCreator, setShowAdminCreator] = useState(false);
  const [showSecurityCreator, setShowSecurityCreator] = useState(false);
  const [showStaffCreator, setShowStaffCreator] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authController.login({ email, password });

      if (!result.token) {
        throw new Error(result.message || 'Failed to sign in');
      }

      const decoded = jwtDecode<DecodedToken>(result.token);
      const backendUser = result.user as BackendUser | undefined;

      const resolvedUserId =
        backendUser?.userId ??
        toNumericId(decoded.userId) ??
        toNumericId(decoded.UserId) ??
        toNumericId(decoded.sub);

      if (resolvedUserId == null) {
        throw new Error('User ID missing in login response');
      }

      const resolvedEmail = backendUser?.email ?? decoded.email ?? decoded.Email ?? email;
      const resolvedName = backendUser?.fullName ?? decoded.fullName ?? decoded.FullName ?? 'User';
      const resolvedRole =
        backendUser?.role?.roleName ??
        decoded.role ??
        decoded.Role ??
        decoded.roleName ??
        decoded.RoleName ??
        '';

      const user: User = {
        id: resolvedUserId.toString(),
        name: resolvedName,
        email: resolvedEmail,
        role: resolveRole(resolvedRole),
        campus: 'FU_FPT', // Default, backend doesn't have campus info on user
      };

      localStorage.setItem('authToken', result.token);

      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    
    // Loading & error
    loading,
    error,
    
    // Dialog state
    showInitializer,
    setShowInitializer,
    showAdminCreator,
    setShowAdminCreator,
    showSecurityCreator,
    setShowSecurityCreator,
    showStaffCreator,
    setShowStaffCreator,
    
    // Actions
    handleSubmit,
  };
}