import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { adminApi, UserData } from '../../api/api';
import authController from '../../api/api/controllers/authController';
import { ROLE_ID_MAP, type RegistrableRole, isAllowedEmailDomain } from '../../utils/userRoles';

type CreateFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RegistrableRole;
};

const createInitialFormState = (): CreateFormState => ({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
});

export function useUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserData['role']>('student');

  // Create form state
  const [createForm, setCreateForm] = useState<CreateFormState>(() => createInitialFormState());
  const [createError, setCreateError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data.filter(u => u.status !== 'Inactive'));
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    const success = await adminApi.updateUser(selectedUser.id, {
      name: editName,
      role: editRole,
    });

    if (success) {
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } else {
      toast.error('Failed to update user');
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;

    const success = await adminApi.deactivateUser(selectedUser.id, selectedUser.name);
    if (success) {
      toast.success('User deactivated successfully');
      setDeactivateDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } else {
      toast.error('Failed to deactivate user');
    }
  };

  const getRoleBadge = (role: UserData['role']) => {
    const colors = {
      student: 'bg-blue-50 text-blue-700 border-blue-200',
      lecturer: 'bg-purple-50 text-purple-700 border-purple-200',
      staff: 'bg-green-50 text-green-700 border-green-200',
      security: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      admin: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const updateCreateForm = <K extends keyof CreateFormState>(field: K, value: CreateFormState[K]) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCreateForm = (): string | null => {
    if (!createForm.name.trim()) {
      return 'Full name is required';
    }
    if (!isAllowedEmailDomain(createForm.email)) {
      return 'Use your @fpt.edu.vn or @fe.edu.vn email';
    }
    if (createForm.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (createForm.password !== createForm.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleCreateDialogToggle = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setCreateError('');
      setCreateForm(createInitialFormState());
    }
  };

  const handleCreateUser = async () => {
    setCreateError('');
    const validationError = validateCreateForm();
    if (validationError) {
      setCreateError(validationError);
      return;
    }

    setCreatingUser(true);

    try {
      const roleId = ROLE_ID_MAP[createForm.role];
      await authController.createUser({
        fullName: createForm.name,
        email: createForm.email,
        password: createForm.password,
        roleId,
      });

      toast.success('User created successfully');
      handleCreateDialogToggle(false);
      loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      setCreateError(message);
      toast.error(message);
    } finally {
      setCreatingUser(false);
    }
  };

  return {
    users,
    loading,
    editDialogOpen,
    setEditDialogOpen,
    deactivateDialogOpen,
    setDeactivateDialogOpen,
    selectedUser,
    setSelectedUser,
    editName,
    setEditName,
    editRole,
    setEditRole,
    handleEditUser,
    handleSaveEdit,
    handleDeactivateUser,
    getRoleBadge,
    createDialogOpen,
    handleCreateDialogToggle,
    createForm,
    updateCreateForm,
    createError,
    creatingUser,
    handleCreateUser,
  };
}
