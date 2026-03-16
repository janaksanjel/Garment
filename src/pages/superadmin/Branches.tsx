import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for branches
const mockBranches = [
  {
    id: '1',
    name: 'Main Branch',
    address: '123 Main Street',
    city: 'New York',
    country: 'USA',
    phone: '+1 555-0100',
    email: 'main@brand.com',
    manager: 'John Doe',
    employees: 25,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Downtown Branch',
    address: '456 Downtown Ave',
    city: 'New York',
    country: 'USA',
    phone: '+1 555-0200',
    email: 'downtown@brand.com',
    manager: 'Jane Smith',
    employees: 18,
    isActive: true,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Warehouse Branch',
    address: '789 Industrial Blvd',
    city: 'Brooklyn',
    country: 'USA',
    phone: '+1 555-0300',
    email: 'warehouse@brand.com',
    manager: 'Mike Johnson',
    employees: 12,
    isActive: false,
    createdAt: '2024-03-10',
  },
];

const Branches: React.FC = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    manager: '',
    employees: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding branch:', formData);
    // Add branch logic here
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      manager: '',
      employees: '',
    });
    setShowAddForm(false);
  };

  const filteredBranches = mockBranches.filter((branch) =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/brands')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Brand Branches
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all branches and locations for this brand
          </p>
        </div>
        <Button 
          className="btn-accent-gradient gap-2"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Branch'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Branches</p>
            <p className="text-2xl font-bold">{mockBranches.length}</p>
          </div>
        </div>
        
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Branches</p>
            <p className="text-2xl font-bold">{mockBranches.filter(b => b.isActive).length}</p>
          </div>
        </div>
        
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-2xl font-bold">
              {mockBranches.reduce((sum, b) => sum + b.employees, 0)}
            </p>
          </div>
        </div>
        
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cities</p>
            <p className="text-2xl font-bold">
              {new Set(mockBranches.map(b => b.city)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search branches, cities, or managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Add Branch Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card-elevated overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Add New Branch</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="border border-border rounded-lg p-4">
                <legend className="px-2 text-sm font-medium text-muted-foreground">Basic Information</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Branch Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Downtown Branch"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Manager *</label>
                    <Input
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Employees Count</label>
                  <Input
                    type="number"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    placeholder="e.g., 25"
                    min="0"
                  />
                </div>
              </fieldset>

              <fieldset className="border border-border rounded-lg p-4">
                <legend className="px-2 text-sm font-medium text-muted-foreground">Location & Contact</legend>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Country"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 555-0100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="branch@brand.com"
                    />
                  </div>
                </div>
              </fieldset>
              
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-accent-gradient">
                  Create Branch
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated overflow-hidden group"
          >
            {/* Header */}
            <div className="h-20 bg-gradient-to-br from-primary/10 to-accent/10 relative">
              <div className="absolute -bottom-4 left-6">
                <div className="w-12 h-12 rounded-lg bg-card border-4 border-background flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Edit className="w-4 h-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                    <Trash2 className="w-4 h-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Content */}
            <div className="p-6 pt-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground">Manager: {branch.manager}</p>
                </div>
                {branch.isActive ? (
                  <span className="badge-success px-2 py-0.5 rounded-full text-xs font-medium">
                    Active
                  </span>
                ) : (
                  <span className="badge-warning px-2 py-0.5 rounded-full text-xs font-medium">
                    Inactive
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {branch.address}, {branch.city}, {branch.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{branch.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{branch.employees} employees</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(branch.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Add New Branch Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAddForm(true)}
          className="card-elevated min-h-[280px] flex items-center justify-center cursor-pointer border-dashed hover:border-accent/50 transition-all group"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
              <Plus className="w-8 h-8 text-accent" />
            </div>
            <p className="font-semibold">Add New Branch</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new branch location
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Branches;