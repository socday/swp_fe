import { User } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building2, Loader2, Users, UserCog, Shield, Briefcase, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { UserInitializer } from '../shared/UserInitializer';
import { AdminAccountCreator } from './AdminAccountCreator';
import { SecurityAccountCreator } from './SecurityAccountCreator';
import { StaffAccountCreator } from './StaffAccountCreator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useLogin } from './useLogin';

interface LoginProps {
  onLogin: (user: User) => void;
  onShowRegister: () => void;
}

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const {
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
  } = useLogin({ onLogin });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-orange-500 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl">FPTU HCM</CardTitle>
            <CardDescription>Multi-campus Facility Booking System</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@fpt.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 text-red-700 p-3 rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600 mb-3">
                Don't have an account?
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
                  onClick={onShowRegister}
                  disabled={loading}
                >
                  Create New Account
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 space-y-3"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowInitializer(true)}
                  disabled={loading}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Create Demo Accounts
                </Button>
              </motion.div>

              <p className="text-center text-xs text-gray-500">
                Creates 7 demo users (3 students, 2 lecturers, 2 admins)
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAdminCreator(true)}
                  disabled={loading}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Create Admin Account
                </Button>
              </motion.div>

              <p className="text-center text-xs text-gray-500">
                Creates a new admin account
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSecurityCreator(true)}
                  disabled={loading}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Create Security Account
                </Button>
              </motion.div>

              <p className="text-center text-xs text-gray-500">
                Creates 2 security accounts for facility management
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowStaffCreator(true)}
                  disabled={loading}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Create Staff Account
                </Button>
              </motion.div>

              <p className="text-center text-xs text-gray-500">
                Creates 2 staff accounts for facility management
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Initializer Dialog */}
      <Dialog open={showInitializer} onOpenChange={setShowInitializer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Demo Accounts</DialogTitle>
            <DialogDescription>
              Initialize the system with 7 demo user accounts for testing
            </DialogDescription>
          </DialogHeader>
          <UserInitializer onClose={() => setShowInitializer(false)} />
        </DialogContent>
      </Dialog>

      {/* Admin Account Creator Dialog */}
      <Dialog open={showAdminCreator} onOpenChange={setShowAdminCreator}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Admin Accounts</DialogTitle>
            <DialogDescription>
              Create 2 admin accounts - one for each campus (FU FPT & NVH)
            </DialogDescription>
          </DialogHeader>
          <AdminAccountCreator />
        </DialogContent>
      </Dialog>

      {/* Security Account Creator Dialog */}
      <Dialog open={showSecurityCreator} onOpenChange={setShowSecurityCreator}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Security Accounts</DialogTitle>
            <DialogDescription>
              Create 2 security accounts - one for each campus (FU FPT & NVH)
            </DialogDescription>
          </DialogHeader>
          <SecurityAccountCreator />
        </DialogContent>
      </Dialog>

      {/* Staff Account Creator Dialog */}
      <Dialog open={showStaffCreator} onOpenChange={setShowStaffCreator}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Staff Accounts</DialogTitle>
            <DialogDescription>
              Create 2 staff accounts - one for each campus (FU FPT & NVH)
            </DialogDescription>
          </DialogHeader>
          <StaffAccountCreator />
        </DialogContent>
      </Dialog>
    </div>
  );
}