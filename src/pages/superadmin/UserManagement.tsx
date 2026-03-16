import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const UserManagement: React.FC = () => {
  const { isSuperAdmin, hasPermission } = useAuthStore();
  
  if (!isSuperAdmin() && !hasPermission('canManageUsers')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Crown className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to manage users</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">Brand-specific user CRUD coming soon</p>
      </div>
    </motion.div>
  );
};

export default UserManagement;
