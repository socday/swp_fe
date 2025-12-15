import { useState } from 'react';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { LecturerDashboard } from './components/dashboards/LecturerDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { StaffDashboard } from './components/dashboards/StaffDashboard';
import { SecurityDashboard } from './components/dashboards/SecurityDashboard';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { DataInitializer } from './components/shared/DataInitializer';
import { BackendStatus } from './components/shared/BackendStatus';
import { BackendTestPage } from './components/test/BackendTestPage';

export type UserRole = 'student' | 'lecturer' | 'admin' | 'staff' | 'security' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campus?: 'FU_FPT' | 'NVH';
}

type AuthView = 'login' | 'register';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [authView, setAuthView] = useState<AuthView>('login');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setAuthView('login');
  };

  const handleRegisterSuccess = () => {
    setAuthView('login');
  };

  if (!currentUser) {
    return (
      <div>
        {authView === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            onShowRegister={() => setAuthView('register')}
          />
        ) : (
          <Register 
            onBack={() => setAuthView('login')}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {currentUser.role === 'student' && (
          <StudentDashboard user={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.role === 'lecturer' && (
          <LecturerDashboard user={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.role === 'admin' && (
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.role === 'staff' && (
          <StaffDashboard user={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.role === 'security' && (
          <SecurityDashboard user={currentUser} onLogout={handleLogout} />
        )}
        <BackendStatus />
      </div>
  );
}

export default App;