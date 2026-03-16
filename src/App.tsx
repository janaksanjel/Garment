import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { authAPI } from '@/BaseAPI/apiauth';

// Pages
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/shopadmin/Dashboard';
import StockManagement from '@/pages/shopadmin/StockManagement';
import CuttingManagement from '@/pages/shopadmin/CuttingManagement';
import StitchingManagement from '@/pages/shopadmin/StitchingManagement';
import PackagingManagement from '@/pages/shopadmin/PackagingManagement';
import WarehouseManagement from '@/pages/shopadmin/WarehouseManagement';
import SalesManagement from '@/pages/shopadmin/SalesManagement';
import Reports from '@/pages/shopadmin/Reports';
import BrandManagement from '@/pages/superadmin/BrandManagement';
import UserManagement from '@/pages/superadmin/UserManagement';
import SettingsPage from '@/pages/SettingsPage';
import ShopStaff from '@/pages/shopadmin/ShopStaff';
import BranchManagement from '@/pages/shopadmin/BranchManagement';
import CustomerManagement from '@/pages/shopadmin/CustomerManagement';
import Branches from '@/pages/superadmin/Branches';
import NotFound from '@/pages/NotFound';

// Layout
import MainLayout from '@/components/layout/MainLayout';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, logout, isLoading } = useAuthStore();
  const { theme } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Apply theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Auth state is persisted via zustand-persist, just mark ready
    setIsReady(true);
  }, [theme, isAuthenticated]);

  const handleLogout = async () => {
    const token = localStorage.getItem('igms-auth-token');
    
    if (token) {
      try {
        await authAPI.logout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    logout();
  };

  const handleLoginSuccess = () => {
    // Navigation handled by React Router
  };

  if (!isReady || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HashRouter>
          <Routes>
            {/* Public Route */}
            <Route 
              path="/login" 
              element={
                isAuthenticated 
                  ? <Navigate to="/dashboard" replace /> 
                  : <LoginPage onLoginSuccess={handleLoginSuccess} />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <MainLayout onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stock" element={<StockManagement />} />
              <Route path="/cutting" element={<CuttingManagement />} />
              <Route path="/stitching" element={<StitchingManagement />} />
              <Route path="/packaging" element={<PackagingManagement />} />
              <Route path="/warehouse" element={<WarehouseManagement />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/shop-staff" element={<ShopStaff />} />
              <Route path="/branch-management" element={<BranchManagement />} />
              <Route path="/brands" element={<BrandManagement />} />
              <Route path="/brands/:brandId/branches" element={<Branches />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
