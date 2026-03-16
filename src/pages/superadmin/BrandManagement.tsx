import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, ROLE_LABELS } from '@/store/authStore';
import { brandAPI } from '@/BaseAPI/apiauth';
import type { Brand, BrandCreateData } from '@/BaseAPI/apiauth';
import {
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    MoreHorizontal,
    Users,
    Database,
    Globe,
    Phone,
    Mail,
    MapPin,
    Crown,
    Copy,
    Check,
    X,
    Upload,
    ExternalLink,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Brand, BrandMoreInfo } from '@/types';

const BrandManagement: React.FC = () => {
    const navigate = useNavigate();
    const { isSuperAdmin, setActiveBrand } = useAuthStore();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            setLoading(true);
            const data = await brandAPI.getAll();
            setBrands(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load brands',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };
    const [formData, setFormData] = useState({
        name: '',
        logoUrl: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        description: '',
        taxId: '',
        website: '',
        loginUsername: '',
        loginPassword: '',
        // Database configuration
        dbname: '',
        dbHost: '',
        dbPort: '',
        dbUser: '',
        dbPassword: '',
        dbDatabase: '',
    });

    if (!isSuperAdmin()) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Crown className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold mb-2">Access Restricted</h2>
                    <p className="text-muted-foreground">
                        Only Super Admins can manage brands and databases
                    </p>
                </div>
            </div>
        );
    }

    const filteredBrands = brands.filter((brand) => {
        const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            brand.dbname.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !showActiveOnly || brand.is_active;
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const brandData: BrandCreateData = {
                name: formData.name || 'Default Brand',
                dbname: formData.dbname || 'default_db',
                db_user: formData.dbUser || 'admin',
                db_database: formData.dbDatabase || formData.dbname || 'default_db',
                db_host: formData.dbHost || 'localhost',
                db_port: formData.dbPort || '5432',
                address: formData.address || '',
                city: formData.city || '',
                country: formData.country || '',
                phone: formData.phone || '',
                email: formData.email || '',
                description: formData.description || '',
                tax_id: formData.taxId || '',
                website: formData.website,
                loginUsername: formData.loginUsername,
                loginPassword: formData.loginPassword,
                is_active: true,
            };

            // Only include password if provided (for editing) or if creating new brand
            if (!editingBrand || formData.dbPassword) {
                brandData.db_password = formData.dbPassword || 'password123';
            }

            // Only include logo if file is selected
            if (logoFile) {
                brandData.logo = logoFile;
            }

            if (editingBrand) {
                await brandAPI.update(editingBrand.id, brandData);
                toast({
                    title: 'Brand Updated',
                    description: `${formData.name} has been updated successfully`,
                });
            } else {
                await brandAPI.create(brandData);
                toast({
                    title: '👑 Brand Created',
                    description: `${formData.name} with database "${formData.dbname}" has been created`,
                });
            }

            await loadBrands();
            resetForm();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Operation failed',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            // Create a preview URL for display
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, logoUrl: url });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            dbname: '',
            logoUrl: '',
            address: '',
            city: '',
            country: '',
            phone: '',
            email: '',
            description: '',
            taxId: '',
            website: '',
            loginUsername: '',
            loginPassword: '',
            // Database configuration
            dbHost: '',
            dbPort: '',
            dbUser: '',
            dbPassword: '',
            dbDatabase: '',
        });
        setShowAddForm(false);
        setEditingBrand(null);
        setLogoFile(null);
    };

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            dbname: brand.dbname || brand.db_database,
            logoUrl: brand.logo || '',
            address: brand.address || '',
            city: brand.city || '',
            country: brand.country || '',
            phone: brand.phone || '',
            email: brand.email || '',
            description: brand.description || '',
            taxId: brand.tax_id || '',
            website: brand.website || '',
            loginUsername: '',
            loginPassword: '',
            // Database configuration from API response
            dbHost: brand.db_host || '',
            dbPort: brand.db_port || '',
            dbUser: brand.db_user || '',
            dbPassword: brand.db_password || '', // Populate password from API
            dbDatabase: brand.db_database || '',
        });
        setShowAddForm(true);
    };

    const handleToggleStatus = async (brand: Brand) => {
        try {
            setLoading(true);
            await brandAPI.changeStatus('brand', brand.id, !brand.is_active);
            toast({
                title: 'Status Updated',
                description: `${brand.name} has been ${!brand.is_active ? 'activated' : 'deactivated'}`,
            });
            await loadBrands();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update status',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async (brand: Brand) => {
        try {
            setLoading(true);
            
            // Find next available copy number
            const baseName = brand.name.replace(/ \(\d+\)$/, ''); // Remove existing (n) suffix
            const baseDbName = (brand.db_database || brand.dbname || 'default_db').replace(/_\d+$/, ''); // Remove existing _n suffix
            
            let copyNumber = 1;
            let newName = `${baseName} (${copyNumber})`;
            let newDbName = `${baseDbName}_${copyNumber}`;
            
            // Check if name already exists and increment
            while (brands.some(b => b.name === newName || b.db_database === newDbName)) {
                copyNumber++;
                newName = `${baseName} (${copyNumber})`;
                newDbName = `${baseDbName}_${copyNumber}`;
            }
            
            // Fetch logo file if exists
            let logoFile: File | undefined;
            if (brand.logo) {
                try {
                    const response = await fetch(brand.logo);
                    const blob = await response.blob();
                    logoFile = new File([blob], 'logo.png', { type: blob.type });
                } catch (error) {
                    console.warn('Failed to fetch logo for duplication:', error);
                }
            }
            
            const duplicateData: BrandCreateData = {
                name: newName,
                dbname: newDbName,
                db_user: 'admin',
                db_password: 'password123',
                db_database: newDbName,
                db_host: brand.db_host || 'localhost',
                db_port: brand.db_port || '5432',
                address: brand.address || '',
                city: brand.city || '',
                country: brand.country || '',
                phone: brand.phone || '',
                email: brand.email || '',
                description: brand.description || '',
                tax_id: brand.tax_id || '',
                website: brand.website || '',
                logo: logoFile,
            };
            
            await brandAPI.create(duplicateData);
            toast({
                title: 'Brand Duplicated',
                description: `Created "${newName}" as a copy`,
            });
            await loadBrands();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to duplicate brand',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (brand: Brand) => {
        try {
            setLoading(true);
            await brandAPI.delete(brand.id);
            toast({
                title: 'Brand Deleted',
                description: `${brand.name} and all associated data has been removed`,
                variant: 'destructive',
            });
            await loadBrands();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete brand',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchToBrand = (brand: Brand) => {
        setActiveBrand(brand.id, brand.dbname);
        toast({
            title: 'Brand Switched',
            description: `Now viewing ${brand.name} (${brand.dbname})`,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            Brand & Database Management
                        </h1>
                        <span className="god-mode-badge">Super Admin Only</span>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Create and manage brands, databases, and organization settings
                    </p>
                </div>

                <Button
                    className="btn-accent-gradient gap-2"
                    onClick={() => setShowAddForm(!showAddForm)}
                    disabled={loading}
                >
                    <Plus className="w-4 h-4" />
                    {showAddForm ? 'Cancel' : 'Add Brand'}
                </Button>
            </div>

            {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card-elevated p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Brands</p>
                            <p className="text-2xl font-bold">{brands.length}</p>
                        </div>
                    </div>

                    <div className="card-elevated p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                            <Database className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Databases</p>
                            <p className="text-2xl font-bold">{brands.filter(b => b.is_active).length}</p>
                        </div>
                    </div>

                    <div className="card-elevated p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold">
                                {brands.reduce((sum, b) => sum + (b.user_count || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

            {/* Search */}
            <div className="card-elevated p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search brands or databases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 max-w-md"
                        />
                    </div>
                    <Button
                        variant={showActiveOnly ? "default" : "outline"}
                        onClick={() => setShowActiveOnly(!showActiveOnly)}
                        className="gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {showActiveOnly ? 'Show All' : 'Active Only'}
                    </Button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card-elevated overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Crown className="w-5 h-5 text-accent" />
                            <h2 className="text-xl font-semibold">
                                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <fieldset className="border border-border rounded-lg p-4">
                                <legend className="px-2 text-sm font-medium text-muted-foreground">Basic Information</legend>
                                <div className="mt-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Brand Name *</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Anee Clothing"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-2">Logo</label>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                                        />
                                        {formData.logoUrl && (
                                            <div className="w-16 h-16 rounded-lg border border-border overflow-hidden">
                                                <img
                                                    src={formData.logoUrl}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the brand..."
                                        className="w-full h-20 px-4 py-3 rounded-lg border border-border bg-background resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                    />
                                </div>
                            </fieldset>

                            <fieldset className="border border-info/20 rounded-lg p-4 bg-info/5">
                                <legend className="px-2 text-sm font-medium text-info flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Database Configuration
                                </legend>
                                <p className="text-sm text-muted-foreground mb-4 mt-2">
                                    Configure database connection settings for this brand
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Database Name *</label>
                                        <Input
                                            value={formData.dbDatabase}
                                            onChange={(e) => setFormData({ ...formData, dbDatabase: e.target.value })}
                                            placeholder="Enter your database name here"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Database User *</label>
                                        <Input
                                            value={formData.dbUser}
                                            onChange={(e) => setFormData({ ...formData, dbUser: e.target.value })}
                                            placeholder="Enter your database username here"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Database Password {editingBrand ? '(leave empty to keep current)' : '*'}
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.dbPassword}
                                                onChange={(e) => setFormData({ ...formData, dbPassword: e.target.value })}
                                                placeholder={editingBrand ? "Leave empty to keep current password" : "Enter your database password here"}
                                                required={!editingBrand}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Host *</label>
                                        <Input
                                            value={formData.dbHost}
                                            onChange={(e) => setFormData({ ...formData, dbHost: e.target.value })}
                                            placeholder="Enter your database host here"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Port *</label>
                                        <Input
                                            value={formData.dbPort}
                                            onChange={(e) => setFormData({ ...formData, dbPort: e.target.value })}
                                            placeholder="Enter your database port here"
                                            required
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="border border-border rounded-lg p-4">
                                <legend className="px-2 text-sm font-medium text-muted-foreground">Contact Information</legend>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="contact@brand.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 555-0100"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Address</label>
                                        <Input
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">City</label>
                                        <Input
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Country</label>
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            placeholder="Country"
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="border border-border rounded-lg p-4">
                                <legend className="px-2 text-sm font-medium text-muted-foreground">Additional Details</legend>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tax ID</label>
                                        <Input
                                            value={formData.taxId}
                                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                            placeholder="TX-12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Website</label>
                                        <Input
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://brand.com"
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
                                    Set up admin login credentials for this brand
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Admin Username *</label>
                                        <Input
                                            value={formData.loginUsername}
                                            onChange={(e) => setFormData({ ...formData, loginUsername: e.target.value })}
                                            placeholder="admin"
                                            required={!editingBrand}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Password *</label>
                                        <div className="relative">
                                            <Input
                                                type={showLoginPassword ? "text" : "password"}
                                                value={formData.loginPassword}
                                                onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                                                placeholder="Enter secure password"
                                                required={!editingBrand}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="btn-accent-gradient">
                                    {editingBrand ? 'Update Brand' : 'Create Brand'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}

            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map((brand) => {
                    const userCount = 0; // Remove getUsersByBrand call
                    return (
                        <motion.div
                            key={brand.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-elevated overflow-hidden group"
                        >
                            {/* Header with logo placeholder */}
                            <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 relative">
                                <div className="absolute -bottom-6 left-6">
                                    <div className="w-16 h-16 rounded-xl bg-card border-4 border-background flex items-center justify-center shadow-lg overflow-hidden">
                                        {brand.logo ? (
                                            <img
                                                src={brand.logo}
                                                alt={`${brand.name} logo`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <Building2 className={`w-8 h-8 text-primary ${brand.logo ? 'hidden' : ''}`} />
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
                                    <DropdownMenuContent align="end" className="bg-popover">
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => navigate(`/brands/${brand.id}/branches`)}
                                        >
                                            <Eye className="w-4 h-4" /> See Branches
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => handleToggleStatus(brand)}
                                        >
                                            {brand.is_active ? (
                                                <><X className="w-4 h-4" /> Deactivate</>
                                            ) : (
                                                <><Check className="w-4 h-4" /> Activate</>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => handleEdit(brand)}
                                        >
                                            <Edit className="w-4 h-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer"
                                            onClick={() => handleDuplicate(brand)}
                                        >
                                            <Copy className="w-4 h-4" /> Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-destructive"
                                            onClick={() => handleDelete(brand)}
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{brand.name}</h3>
                                        <p className="text-sm text-muted-foreground font-mono">{brand.dbname}</p>
                                    </div>
                                    {brand.is_active ? (
                                        <span className="badge-success px-2 py-0.5 rounded-full text-xs font-medium">
                      Active
                    </span>
                                    ) : (
                                        <span className="badge-warning px-2 py-0.5 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                                    )}
                                </div>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {brand.description || 'No description provided'}
                                </p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Database className="w-4 h-4" />
                                        <span className="truncate font-mono">{brand.db_database || brand.dbname || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">
                      {brand.city || 'N/A'}, {brand.country || 'N/A'}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{brand.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{userCount} users</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date().toLocaleDateString()}
                  </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/brands/${brand.id}/branches`)}
                                    >
                                        View Branches
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Add New Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setShowAddForm(true)}
                    className="card-elevated min-h-[320px] flex items-center justify-center cursor-pointer border-dashed hover:border-accent/50 transition-all group"
                >
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                            <Plus className="w-8 h-8 text-accent" />
                        </div>
                        <p className="font-semibold">Add New Brand</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create a new brand & database
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BrandManagement;