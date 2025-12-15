import { useState, FormEvent } from 'react';
import { User } from '../../App';
import { authApi } from '../../lib/api';

interface UseLoginProps {
  onLogin: (user: User) => void;
}

export function useLogin({ onLogin }: UseLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInitializer, setShowInitializer] = useState(false);
  const [showAdminCreator, setShowAdminCreator] = useState(false);
  const [showSecurityCreator, setShowSecurityCreator] = useState(false);
  const [showStaffCreator, setShowStaffCreator] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call custom backend API
      const result = await authApi.login({ email, password });

      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    loading,
    error,
    showInitializer,
    setShowInitializer,
    showAdminCreator,
    setShowAdminCreator,
    showSecurityCreator,
    setShowSecurityCreator,
    showStaffCreator,
    setShowStaffCreator,
    handleSubmit,
  };
}
