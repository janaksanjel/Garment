import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, ROLE_LABELS } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useBrandStore } from '@/store/brandStore';
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Crown,
  Building2,
  Check,
  X,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user, isSuperAdmin, activeBrandId, setActiveBrand } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, notifications, unreadCount, markAsRead, markAllAsRead } = useAppStore();
  const { brands, getBrand } = useBrandStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBrandSwitcher, setShowBrandSwitcher] = useState(false);

  const activeBrand = activeBrandId ? getBrand(activeBrandId) : null;
  const roleLabel = user ? ROLE_LABELS[user.role] : '';

  // Filter brands based on user access
  const accessibleBrands = isSuperAdmin() 
    ? brands 
    : brands.filter(b => b.id === user?.brandId);

  const handleBrandSwitch = (brandId: string, dbname: string) => {
    setActiveBrand(brandId, dbname);
    setShowBrandSwitcher(false);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle would go here */}
        
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-80 h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-transparent focus:border-accent focus:bg-background transition-all outline-none text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="w-10 h-10"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-10 h-10 relative">
              <Bell className="w-5 h-5" />
              {unreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                  {unreadCount()}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover">
            <div className="p-3 flex items-center justify-between border-b border-border">
              <p className="font-semibold">Notifications</p>
              {unreadCount() > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-accent hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      'p-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors',
                      !notification.read && 'bg-accent/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                        notification.type === 'success' && 'bg-success',
                        notification.type === 'warning' && 'bg-warning',
                        notification.type === 'error' && 'bg-destructive',
                        notification.type === 'info' && 'bg-info'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 pl-2 pr-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                {isSuperAdmin() ? (
                  <Crown className="w-4 h-4 text-accent" />
                ) : (
                  <span className="text-sm font-semibold text-accent">
                    {user?.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {isSuperAdmin() ? 'God User' : roleLabel}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover">
            <div className="p-3 border-b border-border">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {isSuperAdmin() && (
                <span className="god-mode-badge mt-2 inline-block">
                  Super Admin
                </span>
              )}
            </div>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onLogout}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
