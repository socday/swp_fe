import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { User } from '../../App';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Building2, Loader2, Users, UserCog, Shield, Briefcase, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useLogin } from './useLogin';
import { loginWithGoogle } from '../../api/services/authApi';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import type { User as BackendUser } from '../../api/api';
import './Login.css';

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
  if (normalized == "facilityadmin") return 'staff';
  return ['student', 'lecturer', 'admin', 'staff', 'security'].includes(normalized)
    ? (normalized as User['role'])
    : null;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: string;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config?: any) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}


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
    handleSubmit,
  } = useLogin({ onLogin });

    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);


const handleGoogleCallback = useCallback(async (accessToken: string) => {
  if (!accessToken) {
    setLoadingGoogle(false);
    toast.error("Không nhận được access token từ Google");
    return;
  }

  try {
    setLoadingGoogle(true);

    // POST to backend API with accessToken
    const apiResponse = await loginWithGoogle(accessToken);
    
    if (apiResponse && apiResponse.token) {
      try {
        localStorage.setItem("authToken", apiResponse.token);
        window.dispatchEvent(new Event("token-update"));
        
        const decoded = jwtDecode<DecodedToken>(apiResponse.token);
        console.log('Decoded token:', decoded);
        const backendUser = apiResponse.user as BackendUser | undefined;
  
        const resolvedUserId =
          backendUser?.userId ??
          toNumericId(decoded.userId) ??
          toNumericId(decoded.UserId) ??
          toNumericId(decoded.sub);
  
        if (resolvedUserId == null) {
          throw new Error('User ID missing in login response');
        }
  
        const resolvedEmail = backendUser?.email ?? decoded.email ?? decoded.Email ?? '';
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
        };
        
        toast.success("Đăng nhập Google thành công!");
        
        // Call onLogin to actually log the user in
        onLogin(user);
      } catch (decodeError) {
        console.error("Failed to decode token:", decodeError);
        toast.error("Lỗi xử lý thông tin đăng nhập");
      }
    } else {
      toast.error((apiResponse as any)?.message || "Đăng nhập Google thất bại");
    }
  } catch (err) {
    console.error("Google login error:", err);
    toast.error("Lỗi đăng nhập Google: " + (err instanceof Error ? err.message : String(err)));
  } finally {
    setLoadingGoogle(false);
  }
}, [onLogin]);

  // Load Google Identity Services
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Script already loaded, check if Google is available
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        setGoogleReady(true);
        return;
      }
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    
    const handleScriptLoad = () => {
      // Wait a bit for Google to be fully available
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          clearInterval(checkGoogle);
          setGoogleReady(true);
          console.log("Google OAuth2 loaded successfully");
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
          console.error("Failed to load Google OAuth2");
        }
      }, 5000);
    };

     script.onload = handleScriptLoad;
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script");
      toast.error("Không thể tải Google Identity Services");
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid reloading
    };
  }, []);

  const handleGoogleLogin = () => {
    // Vite uses import.meta.env instead of process.env
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === "") {
      toast.error("Google Client ID chưa được cấu hình. Vui lòng thêm VITE_GOOGLE_CLIENT_ID vào file .env");
      console.error("Google Client ID is missing. Please add VITE_GOOGLE_CLIENT_ID to .env file");
      return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      toast.error("Google đang tải, vui lòng thử lại sau");
      console.error("Google OAuth2 not ready yet");
      return;
    }

    setLoadingGoogle(true);
    toast.error(null);

    try {
      console.log("Initializing Google OAuth2 with Client ID:", clientId.substring(0, 20) + "...");
      
      // Use OAuth2 flow to get access token
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (response: { access_token: string; error?: string }) => {
          if (response.error) {
            toast.error("Đăng nhập Google bị hủy hoặc có lỗi");
            setLoadingGoogle(false);
            return;
          }

          if (response.access_token) {
            console.log("Got Google access token:", response.access_token.substring(0, 20) + "...");
            // Call the callback with access token
            await handleGoogleCallback(response.access_token);
          } else {
            toast.error("Không thể lấy access token từ Google");
            setLoadingGoogle(false);
          }
        },
      });

      // Request access token (this will trigger popup)
      client.requestAccessToken();
    } catch (err: any) {
      console.error("Google login initialization error:", err);
      const errorMessage = err?.message || "Không thể khởi tạo đăng nhập Google";
      toast.error(errorMessage);
      setLoadingGoogle(false);
    }
  }; 

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
 <div className="google-login-container">
              <div className="divider">
                <span>Hoặc</span>
              </div>
              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                className="google-login-btn"
                disabled={loadingGoogle || !googleReady}
              >
                {loadingGoogle ? (
                  <span>Đang đăng nhập...</span>
                ) : !googleReady ? (
                  <span>Đang tải Google...</span>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Đăng nhập bằng Google</span>
                  </>
                )}
              </button>
            </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}