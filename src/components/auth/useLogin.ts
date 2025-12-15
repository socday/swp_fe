import { useState } from 'react';
import { User } from '../../App';
import { authApi, User as BackendUser } from '../../lib/api';

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
      const result = await authApi.login({ email, password });

      if (!result.success || !result.user) {
        throw new Error(result.error || 'Failed to sign in');
      }

      // Convert backend User to App User format
      const backendUser = result.user;
      const roleName = backendUser.role?.roleName?.toLowerCase() || 'student';
      
      // Map role name to UserRole
      let userRole: User['role'] = null;
      if (['student', 'lecturer', 'admin', 'staff', 'security'].includes(roleName)) {
        userRole = roleName as User['role'];
      }

      const user: User = {
        id: backendUser.userId.toString(),
        name: backendUser.fullName,
        email: backendUser.email,
        role: userRole,
        campus: 'FU_FPT', // Default, backend doesn't have campus info on user
      };

      // Store token if provided
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }

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