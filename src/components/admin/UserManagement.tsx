import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserData } from '../../lib/api';
import { Users, UserCog, UserX, Edit, Trash2 } from 'lucide-react';
import { useUserManagement } from './useUserManagement';

export function UserManagement() {
  const {
    users,
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
  } = useUserManagement();

  const renderRoleBadge = (role: UserData['role']) => {
    const badgeClass = getRoleBadge(role);
    return (
      <Badge variant="outline" className={badgeClass}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  // Group users by role
  const usersByRole = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<UserData['role'], UserData[]>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">
              {users.filter(u => u.role === 'student').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Lecturers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">
              {users.filter(u => u.role === 'lecturer').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">
              {users.filter(u => u.role === 'staff').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {users.filter(u => u.role === 'security').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.campus === 'FU_FPT' ? 'FU FPT' : 'NVH'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeactivateDialogOpen(true);
                          }}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedUser && (
              <>
                <div className="space-y-2">
                  <Label>Email (Read-only)</Label>
                  <Input value={selectedUser.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as UserData['role'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Campus</Label>
                  <Select value={editCampus} onValueChange={(v) => setEditCampus(v as 'FU_FPT' | 'NVH')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FU_FPT">FU FPT</SelectItem>
                      <SelectItem value="NVH">NVH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this user account?
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div><span className="font-medium">Name:</span> {selectedUser.name}</div>
              <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
              <div><span className="font-medium">Role:</span> <span className="capitalize">{selectedUser.role}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivateUser}>
              <UserX className="w-4 h-4 mr-2" />
              Deactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}