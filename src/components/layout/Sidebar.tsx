import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore, ROLE_PERMISSIONS } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { useBrandStore } from '@/store/brandStore';
import {
  LayoutDashboard,
  Package,
  Scissors,
  Shirt,
  PackageOpen,
  Warehouse,
  ShoppingCart,
  BarChart3,
  Building2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  permission?: keyof typeof ROLE_PERMISSIONS.super_admin;
  superAdminOnly?: boolean;
  from?: string;
}

const shopAdminItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, from: 'dashboard' },
  { path: '/stock', label: 'Stock Management', icon: Package, permission: 'canAccessWarehouse', from: 'stock' },
  { path: '/cutting', label: 'Cutting', icon: Scissors, permission: 'canAccessProduction', from: 'cutting' },
  { path: '/stitching', label: 'Stitching', icon: Shirt, permission: 'canAccessProduction', from: 'stitching' },
  { path: '/packaging', label: 'Packaging', icon: PackageOpen, permission: 'canAccessProduction', from: 'packaging' },
  { path: '/warehouse', label: 'Warehouse', icon: Warehouse, permission: 'canAccessWarehouse', from: 'warehouse' },
  { path: '/sales', label: 'Sales & POS', icon: ShoppingCart, permission: 'canAccessSales', from: 'sales' },
  { path: '/reports', label: 'Reports', icon: BarChart3, permission: 'canAccessReports', from: 'reports' },
];

const staffAndBranchItems: NavItem[] = [
  { path: '/shop-staff', label: 'Shop Staff', icon: Users },
  { path: '/branch-management', label: 'Branch Management', icon: Building2 },
];

const superAdminItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/brands', label: 'Brands & DBs', icon: Building2, superAdminOnly: true },
  { path: '/users', label: 'User Management', icon: Users, permission: 'canManageUsers' },
  { path: '/settings', label: 'Settings', icon: Settings, permission: 'canAccessSettings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, hasPermission, isSuperAdmin, activeBrandId } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { getBrand } = useBrandStore();

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, [setSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const activeBrand = activeBrandId ? getBrand(activeBrandId) : null;

  const isActiveRoute = (path: string) => location.pathname === path;

  const canAccessItem = (item: NavItem) => {
    if (isSuperAdmin()) return true;
    if (item.superAdminOnly) return false;
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <motion.div 
          className="flex items-center gap-3 overflow-hidden"
          animate={{ opacity: 1 }}
        >
          {!sidebarCollapsed && (
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
          )}
          {!sidebarCollapsed && (
            <motion.div className="flex items-center gap-2">
              
              {activeBrand && (
                <span className="text-sm text-muted-foreground"> {activeBrand.name}</span>
              )}
            </motion.div>
          )}
        </motion.div>
        
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-8 h-8 rounded-lg bg-sidebar-accent/50 flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* God Mode Banner */}
      {isSuperAdmin() && !sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              God Mode Active
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Global Super User • All Access
          </p>
        </motion.div>
      )}

     

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {/* Shop Admin Navigation */}
        {(() => {
          console.log('User role:', user?.role, 'Is shop_admin:', user?.role === 'shop_admin');
          return user?.role === 'shop_admin';
        })() && (
          <>
            <div className="px-3 mb-6">
              {!sidebarCollapsed && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-3">
                  Main Menu
                </p>
              )}
              <ul className="space-y-1">
                {shopAdminItems.map((item) => {
                  if (!canAccessItem(item)) return null;
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={cn(
                          'sidebar-nav-item',
                          isActive && 'active',
                          sidebarCollapsed && 'justify-center px-0'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="px-3 mb-6">
              {!sidebarCollapsed && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-3">
                  Staff & Branch
                </p>
              )}
              <ul className="space-y-1">
                {staffAndBranchItems.map((item) => {
                  console.log('Staff item:', item.label, 'canAccess:', canAccessItem(item), 'hasPermission:', hasPermission(item.permission || 'canManageUsers'));
                  if (!canAccessItem(item)) return null;
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={cn(
                          'sidebar-nav-item',
                          isActive && 'active',
                          sidebarCollapsed && 'justify-center px-0'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {/* Super Admin Navigation */}
        {isSuperAdmin() && (
          <div className="px-3">
            {!sidebarCollapsed && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-3">
                Administration
              </p>
            )}
            <ul className="space-y-1">
              {superAdminItems.map((item) => {
                if (!canAccessItem(item)) return null;
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={cn(
                        'sidebar-nav-item',
                        isActive && 'active',
                        sidebarCollapsed && 'justify-center px-0'
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-accent')} />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;