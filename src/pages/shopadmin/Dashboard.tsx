import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, ROLE_LABELS } from '@/store/authStore';
import { useBrandStore } from '@/store/brandStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { authAPI } from '@/BaseAPI/apiauth';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Scissors,
  DollarSign,
  AlertTriangle,
  ShoppingCart,
  Users,
  ArrowRight,
  Crown,
  Plus,
  BarChart3,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin, activeBrandId } = useAuthStore();
  const { brands, getUsersByBrand } = useBrandStore();
  const { getDashboardKPIs, getLowStockItems, getCuttingOrdersByBrand } = useInventoryStore();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getUserData();
        console.log('User data from /me/ API:', response);
        setUserData(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const kpis = activeBrandId ? getDashboardKPIs(activeBrandId) : null;
  const lowStockItems = activeBrandId ? getLowStockItems(activeBrandId) : [];
  const cuttingOrders = activeBrandId ? getCuttingOrdersByBrand(activeBrandId) : [];
  const brandUsers = activeBrandId ? getUsersByBrand(activeBrandId) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {userData?.username || user?.name?.split(' ')[0]}
          </h1>
          {/*<p className="text-muted-foreground mt-1">*/}
          {/*  {userData?.is_superuser || isSuperAdmin()*/}
          {/*    ? 'Global God Mode Active — Full system access enabled'*/}
          {/*    : `Role: ${user ? ROLE_LABELS[user.role] : ''}`*/}
          {/*  }*/}
          {/*</p>*/}
          {/*{userData && (*/}
          {/*  <div className="mt-2 text-sm text-muted-foreground">*/}
          {/*    <p>Email: {userData.email}</p>*/}
          {/*    <p>User ID: {userData.id}</p>*/}
          {/*    <p>Staff: {userData.is_staff ? 'Yes' : 'No'}</p>*/}
          {/*    <p>Superuser: {userData.is_superuser ? 'Yes' : 'No'}</p>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
        
        {isSuperAdmin() && (
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/brands')}
              className="btn-accent-gradient gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
            <Button 
              onClick={() => navigate('/users')}
              variant="outline"
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Users
            </Button>
          </div>
        )}
      </motion.div>

      {/* Super Admin Overview */}
      {isSuperAdmin() && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-elevated p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Brands</p>
              <p className="text-2xl font-bold">{brands.length}</p>
            </div>
          </div>
          
          <div className="card-elevated p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">
                {brands.reduce((sum, b) => sum + b.userCount, 0) + 1}
              </p>
            </div>
          </div>
          
          <div className="card-elevated p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active DBs</p>
              <p className="text-2xl font-bold">{brands.filter(b => b.isActive).length}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-accent" />
              </div>
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                kpis.stockValueChange >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {kpis.stockValueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(kpis.stockValueChange)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Total Stock Value</p>
            <p className="text-2xl font-bold mt-1">
              ${kpis.totalStockValue.toLocaleString()}
            </p>
          </div>

          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-info" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {kpis.productionTarget > 0 
                  ? Math.round((kpis.productionProgress / kpis.productionTarget) * 100)
                  : 0}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Production Progress</p>
            <p className="text-2xl font-bold mt-1">
              {kpis.productionProgress} / {kpis.productionTarget}
            </p>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-info rounded-full transition-all"
                style={{ 
                  width: `${kpis.productionTarget > 0 
                    ? Math.min((kpis.productionProgress / kpis.productionTarget) * 100, 100)
                    : 0}%` 
                }}
              />
            </div>
          </div>

          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                kpis.salesChange >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {kpis.salesChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(kpis.salesChange)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Sales Today</p>
            <p className="text-2xl font-bold mt-1">
              ${kpis.salesToday.toLocaleString()}
            </p>
          </div>

          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              {kpis.lowStockItems > 0 && (
                <span className="badge-warning px-2 py-0.5 rounded-full text-xs font-semibold">
                  Alert
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold mt-1">{kpis.lowStockItems}</p>
          </div>
        </motion.div>
      )}

      {/* Main Content Grid */}
      {!isSuperAdmin() && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Production */}
          <motion.div variants={itemVariants} className="lg:col-span-2 card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold">Active Production</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-accent"
                onClick={() => navigate('/cutting')}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {cuttingOrders.length === 0 ? (
              <div className="py-12 text-center">
                <Scissors className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No active production orders</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => navigate('/cutting')}
                >
                  Create Order
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cuttingOrders.slice(0, 3).map((order) => (
                  <div 
                    key={order.id}
                    className="p-4 rounded-lg border border-border hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Scissors className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{order.batchCode}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.colors.join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        order.status === 'completed' && 'badge-success',
                        order.status === 'in_progress' && 'badge-info',
                        order.status === 'pending' && 'badge-warning'
                      )}>
                        {order.status.replace('_', ' ').charAt(0).toUpperCase() + 
                         order.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progress: {order.completedPieces} / {order.totalPieces}
                      </span>
                      <span className="font-medium">
                        {Math.round((order.completedPieces / order.totalPieces) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((order.completedPieces / order.totalPieces) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Stats / Low Stock Alert */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Low Stock Alert */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold">Low Stock Alert</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-accent"
                  onClick={() => navigate('/stock')}
                >
                  View All
                </Button>
              </div>
              
              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center">
                  <Package className="w-10 h-10 text-success/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All stock levels healthy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.slice(0, 4).map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                    >
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} / {item.minQuantity} {item.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card-elevated p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/sales')}
                >
                  <ShoppingCart className="w-5 h-5 text-accent" />
                  <span className="text-xs">New Sale</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/stock')}
                >
                  <Package className="w-5 h-5 text-info" />
                  <span className="text-xs">Stock In</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/cutting')}
                >
                  <Scissors className="w-5 h-5 text-success" />
                  <span className="text-xs">New Batch</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => navigate('/reports')}
                >
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="text-xs">Reports</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Super Admin Only Section */}
      {isSuperAdmin() && (
        <motion.div variants={itemVariants} className="card-elevated p-6">
          <h2 className="text-lg font-display font-semibold mb-4">System Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-6 flex-col gap-3"
              onClick={() => navigate('/system-logs')}
            >
              <Activity className="w-6 h-6 text-info" />
              <span className="text-sm font-medium">System Logs</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex-col gap-3"
              onClick={() => navigate('/database-backup')}
            >
              <Package className="w-6 h-6 text-success" />
              <span className="text-sm font-medium">DB Backup</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex-col gap-3"
              onClick={() => navigate('/global-settings')}
            >
              <Crown className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium">Global Settings</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-6 flex-col gap-3"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Analytics</span>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
