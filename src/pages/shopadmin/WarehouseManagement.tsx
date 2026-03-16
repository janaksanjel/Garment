import React from 'react';
import { motion } from 'framer-motion';
import { Warehouse } from 'lucide-react';

const WarehouseManagement: React.FC = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Warehouse className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="text-2xl font-display font-bold mb-2">Warehouse Management</h2>
      <p className="text-muted-foreground">Zone configuration & inventory reconciliation coming soon</p>
    </div>
  </motion.div>
);

export default WarehouseManagement;
