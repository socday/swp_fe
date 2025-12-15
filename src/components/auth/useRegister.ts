import { useState } from 'react';
import type { CreateUserRequest } from '../../api/api';
import authController from '../../api/api/controllers/authController';
import { ROLE_ID_MAP, type RegistrableRole, isAllowedEmailDomain } from '../../utils/userRoles';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RegistrableRole;
  campus: 'FU_FPT' | 'NVH';
}

interface UseRegisterProps {
  onRegisterSuccess: () => void;
}

export function useRegister({ onRegisterSuccess }: UseRegisterProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    campus: 'FU_FPT',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): string | null => {
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (!isAllowedEmailDomain(formData.email)) {
      return 'Please use your FPT University email (@fpt.edu.vn or @fe.edu.vn)';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const roleId = ROLE_ID_MAP[formData.role];
      if (!roleId) {
        throw new Error('Unsupported role selected.');
      }

      const payload: CreateUserRequest = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        roleId,
      };

      await authController.createUser(payload);

      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return {
    formData,
    updateFormField,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    loading,
    error,
    success,
    handleSubmit,
  };
}