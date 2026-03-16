import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, AuthState, Brand } from '@/types';
import { BASE_URL } from '@/BaseAPI/baseurl';

// Demo users for testing
export const DEMO_USERS: User[] = [
  {
    id: 'super-admin-1',
    email: 'admin@clothing.com',
    name: 'Super Administrator',
    role: 'super_admin',
    brandId: null, // Global - not tied to any brand
    avatar: '',
    phone: '+1 555-0100',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'shop-admin-1',
    email: 'shopadmin@aneeclothing.com',
    name: 'Mike Shop',
    role: 'shop_admin',
    brandId: 'anee-clothing',
    avatar: '',
    phone: '+1 555-0103',
    createdAt: '2024-02-15T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
];

// Demo passwords
const DEMO_PASSWORDS: Record<string, string> = {
  'admin@clothing.com': 'okpassword1234',
  'shopadmin@aneeclothing.com': 'password123',
};

// Role display names
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin (God User)',
  admin: 'Brand Admin',
  production_manager: 'Production Manager',
  store_manager: 'Store Manager',
  cutting_supervisor: 'Cutting Supervisor',
  stitching_supervisor: 'Stitching Supervisor',
  sales_staff: 'Sales Staff',
  shop_admin: 'Shop Admin',
};

// Role permissions
export const ROLE_PERMISSIONS: Record<UserRole, {
  canManageBrands: boolean;
  canManageUsers: boolean;
  canAccessProduction: boolean;
  canAccessSales: boolean;
  canAccessWarehouse: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  isGlobalAccess: boolean;
}> = {
  super_admin: {
    canManageBrands: true,
    canManageUsers: true,
    canAccessProduction: true,
    canAccessSales: true,
    canAccessWarehouse: true,
    canAccessReports: true,
    canAccessSettings: true,
    isGlobalAccess: true,
  },
  admin: {
    canManageBrands: false,
    canManageUsers: true, // Within their brand only
    canAccessProduction: true,
    canAccessSales: true,
    canAccessWarehouse: true,
    canAccessReports: true,
    canAccessSettings: true,
    isGlobalAccess: false,
  },
  production_manager: {
    canManageBrands: false,
    canManageUsers: false,
    canAccessProduction: true,
    canAccessSales: false,
    canAccessWarehouse: true,
    canAccessReports: true,
    canAccessSettings: false,
    isGlobalAccess: false,
  },
  store_manager: {
    canManageBrands: false,
    canManageUsers: false,
    canAccessProduction: false,
    canAccessSales: true,
    canAccessWarehouse: true,
    canAccessReports: true,
    canAccessSettings: false,
    isGlobalAccess: false,
  },
  cutting_supervisor: {
    canManageBrands: false,
    canManageUsers: false,
    canAccessProduction: true,
    canAccessSales: false,
    canAccessWarehouse: false,
    canAccessReports: false,
    canAccessSettings: false,
    isGlobalAccess: false,
  },
  stitching_supervisor: {
    canManageBrands: false,
    canManageUsers: false,
    canAccessProduction: true,
    canAccessSales: false,
    canAccessWarehouse: false,
    canAccessReports: false,
    isGlobalAccess: false,
    canAccessSettings: false,
  },
  sales_staff: {
    canManageBrands: false,
    canManageUsers: false,
    canAccessProduction: false,
    canAccessSales: true,
    canAccessWarehouse: false,
    canAccessReports: true,
    canAccessSettings: false,
    isGlobalAccess: false,
  },
  shop_admin: {
    canManageBrands: false,
    canManageUsers: false,
    canAccessProduction: true,
    canAccessSales: true,
    canAccessWarehouse: true,
    canAccessReports: true,
    canAccessSettings: false,
    isGlobalAccess: false,
  },
};

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setUser: (userData: any) => void;
  fetchUserData: () => Promise<void>;
  logout: () => void;
  setActiveBrand: (brandId: string, dbname: string) => void;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.super_admin) => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
  (set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    activeBrandId: null,
    activeDbName: null,

    setUser: (userData: any) => {
      const role: UserRole = userData.is_superuser ? 'super_admin' : 'shop_admin';
      
      const user: User = {
        id: userData.id.toString(),
        email: userData.email,
        name: userData.username,
        role,
        brandId: userData.is_superuser ? null : 'default-brand',
        avatar: '',
        phone: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      set({
        user,
        isAuthenticated: true,
        activeBrandId: user.brandId,
        activeDbName: user.brandId ? 'default_db' : null,
      });
    },

    fetchUserData: async () => {
      set({ isLoading: true });
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('igms-auth-token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          get().setUser(data.data.user);
        } else {
          get().logout();
        }
      } catch (error) {
        get().logout();
      } finally {
        set({ isLoading: false });
      }
    },

    login: async (username: string, password: string) => {
      set({ isLoading: true });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = DEMO_USERS.find(u => u.email.toLowerCase() === username.toLowerCase());
      const correctPassword = DEMO_PASSWORDS[username.toLowerCase()];

      if (!user || password !== correctPassword) {
        set({ isLoading: false });
        return { success: false, error: 'Invalid email or password' };
      }

      if (!user.isActive) {
        set({ isLoading: false });
        return { success: false, error: 'Account is deactivated' };
      }

      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };

      set({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        activeBrandId: user.brandId,
        activeDbName: user.brandId ? 'anee_clothing_db' : null,
      });

      return { success: true };
    },

    logout: () => {
      localStorage.removeItem('igms-auth-token');
      set({
        user: null,
        isAuthenticated: false,
        activeBrandId: null,
        activeDbName: null,
      });
    },

    setActiveBrand: (brandId: string, dbname: string) => {
      set({ activeBrandId: brandId, activeDbName: dbname });
    },

    updateUser: (updates: Partial<User>) => {
      const { user } = get();
      if (user) {
        set({ user: { ...user, ...updates } });
      }
    },

    hasPermission: (permission) => {
      const { user } = get();
      if (!user) return false;
      return ROLE_PERMISSIONS[user.role][permission];
    },

    isSuperAdmin: () => {
      const { user } = get();
      return user?.role === 'super_admin';
    },
  }),
  {
    name: 'igms-auth-storage',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      activeBrandId: state.activeBrandId,
      activeDbName: state.activeDbName,
    }),
  }
  )
);
