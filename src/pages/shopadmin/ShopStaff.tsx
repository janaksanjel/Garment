import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Badge,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for staff
const mockStaff = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@brand.com',
    phone: '+1 555-0101',
    position: 'Store Manager',
    department: 'Management',
    salary: 55000,
    hireDate: '2023-01-15',
    address: '123 Main St, New York, NY',
    branch: 'Main Branch',
    addedBy: 'Admin User',
    addedDate: '2023-01-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@brand.com',
    phone: '+1 555-0102',
    position: 'Sales Associate',
    department: 'Sales',
    salary: 35000,
    hireDate: '2023-03-20',
    address: '456 Oak Ave, New York, NY',
    branch: 'Downtown Branch',
    addedBy: 'John Smith',
    addedDate: '2023-03-20',
    isActive: true,
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@brand.com',
    phone: '+1 555-0103',
    position: 'Warehouse Worker',
    department: 'Warehouse',
    salary: 32000,
    hireDate: '2023-06-10',
    address: '789 Pine St, Brooklyn, NY',
    branch: 'Warehouse Branch',
    addedBy: 'Sarah Johnson',
    addedDate: '2023-06-10',
    isActive: false,
  },
];

// Mock branches data
const mockBranches = [
  'Main Branch',
  'Downtown Branch', 
  'Warehouse Branch',
  'Mall Branch',
  'Airport Branch'
];

const ShopStaff: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    address: '',
    branch: '',
    loginEmail: '',
    loginPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding staff:', formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: '',
      address: '',
      branch: '',
      loginEmail: '',
      loginPassword: '',
    });
    setShowAddForm(false);
  };

  const filteredStaff = mockStaff.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Shop Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all staff members and employees
          </p>
        </div>
        <Button 
          className="btn-accent-gradient gap-2"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Staff'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold">{mockStaff.length}</p>
          </div>
        </div>
        
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Staff</p>
            <p className="text-2xl font-bold">{mockStaff.filter(s => s.isActive).length}</p>
          </div>
        </div>
        
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <Badge className="w-6 h-6 text-info" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Departments</p>
            <p className="text-2xl font-bold">
              {new Set(mockStaff.map(s => s.department)).size}
            </p>
          </div>
        </div>
        
        <div className="card-elevated p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Salary</p>
            <p className="text-2xl font-bold">
              रु{Math.round(mockStaff.reduce((sum, s) => sum + s.salary, 0) / mockStaff.length / 1000)}k
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
            placeholder="Search staff by name, position, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card-elevated overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Add New Staff Member</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset className="border border-border rounded-lg p-4">
                <legend className="px-2 text-sm font-medium text-muted-foreground">Personal Information</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.smith@brand.com"
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
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="border border-border rounded-lg p-4">
                <legend className="px-2 text-sm font-medium text-muted-foreground">Job Information</legend>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Position *</label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Sales Associate"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Department *</label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g., Sales"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Branch *</label>
                    <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockBranches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Salary</label>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="35000"
                      min="0"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="border border-accent/20 rounded-lg p-4 bg-accent/5">
                <legend className="px-2 text-sm font-medium text-accent flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Login Credentials
                </legend>
                <p className="text-sm text-muted-foreground mb-4 mt-2">
                  Set up login credentials for this staff member
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Login Email *</label>
                    <Input
                      type="email"
                      value={formData.loginEmail}
                      onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                      placeholder="staff@brand.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <Input
                      type="password"
                      value={formData.loginPassword}
                      onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                      placeholder="Enter secure password"
                      required
                    />
                  </div>
                </div>
              </fieldset>
              
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-accent-gradient">
                  Add Staff Member
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <motion.div
            key={staff.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated overflow-hidden group"
          >
            {/* Header */}
            <div className="h-20 bg-gradient-to-br from-primary/10 to-accent/10 relative">
              <div className="absolute -bottom-4 left-6">
                <div className="w-12 h-12 rounded-lg bg-card border-4 border-background flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-primary" />
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
                  <h3 className="text-lg font-semibold">{staff.name}</h3>
                  <p className="text-sm text-muted-foreground">{staff.position}</p>
                </div>
                {staff.isActive ? (
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
                  <Building2 className="w-4 h-4" />
                  <span>{staff.branch}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge className="w-4 h-4" />
                  <span>{staff.department}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{staff.address}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Hired {new Date(staff.hireDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-semibold text-success">
                    रु{staff.salary.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Added by {staff.addedBy} on {new Date(staff.addedDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Add New Staff Card */}
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
            <p className="font-semibold">Add New Staff</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new staff member
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ShopStaff;