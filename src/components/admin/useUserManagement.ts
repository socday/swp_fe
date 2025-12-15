import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { adminApi, UserData } from '../../api/api';

export function useUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserData['role']>('student');
  const [editCampus, setEditCampus] = useState<'FU_FPT' | 'NVH'>('FU_FPT');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminApi.getUsers();
    setUsers(data.filter(u => u.status !== 'Inactive'));
    setLoading(false);
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditCampus(user.campus);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    const success = await adminApi.updateUser(selectedUser.id, {
      name: editName,
      role: editRole,
      campus: editCampus,
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

    const success = await adminApi.deactivateUser(selectedUser.id);
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
    editCampus,
    setEditCampus,
    handleEditUser,
    handleSaveEdit,
    handleDeactivateUser,
    getRoleBadge,
  };
}
