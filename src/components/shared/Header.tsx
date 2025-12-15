import { User } from '../../App';
import { Button } from '../ui/button';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const campusName = user.campus === 'FU_FPT' ? 'FU FPT Campus' : 'NVH Campus';
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-orange-500" />
              <span className="text-xl">FPTU HCM Booking</span>
            </div>
            <Badge variant="outline" className="text-[20px] font-bold text-[rgb(245,99,17)]">{campusName}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.name}</span>
              <Badge className="capitalize">{user.role}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
