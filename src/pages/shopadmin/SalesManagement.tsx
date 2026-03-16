import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

const SalesManagement: React.FC = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="text-2xl font-display font-bold mb-2">Sales & POS</h2>
      <p className="text-muted-foreground">Full POS interface with customer management coming soon</p>
    </div>
  </motion.div>
);

export default SalesManagement;
