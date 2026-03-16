import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Brand, BrandMoreInfo, User, UserRole } from '@/types';
import { DEMO_USERS } from './authStore';

interface BrandStore {
  brands: Brand[];
  users: User[];
  isLoading: boolean;
  
  // Brand CRUD
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt' | 'userCount'>) => Brand;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  getBrand: (id: string) => Brand | undefined;
  getBrandByDbName: (dbname: string) => Brand | undefined;
  
  // User CRUD (brand-scoped)
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUsersByBrand: (brandId: string) => User[];
  getAllUsers: () => User[];
  
  // Bulk operations
  addMultipleBrands: (brands: Omit<Brand, 'id' | 'createdAt' | 'userCount'>[]) => Brand[];
  duplicateBrand: (brandId: string, newName: string, newDbName: string) => Brand | null;
}

// Initial sample brand (Anee Clothing) - will be added by super admin
const INITIAL_BRAND: Brand = {
  id: 'anee-clothing',
  name: 'Anee Clothing',
  dbname: 'anee_clothing_db',
  logoUrl: '',
  moreInfo: {
    address: '123 Fashion Street',
    city: 'New York',
    country: 'USA',
    phone: '+1 555-0199',
    email: 'info@aneeclothing.com',
    description: 'Premium garment manufacturing and retail brand specializing in contemporary fashion.',
    taxId: 'TX-12345678',
    website: 'https://aneeclothing.com',
    foundedYear: 2020,
  },
  primaryColor: '#f59e0b',
  createdAt: '2024-01-01T00:00:00Z',
  isActive: true,
  userCount: 3,
};

export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      brands: [INITIAL_BRAND],
      users: [...DEMO_USERS],
      isLoading: false,

      addBrand: (brandData) => {
        const newBrand: Brand = {
          ...brandData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          userCount: 0,
        };
        
        set((state) => ({
          brands: [...state.brands, newBrand],
        }));
        
        return newBrand;
      },

      updateBrand: (id, updates) => {
        set((state) => ({
          brands: state.brands.map((brand) =>
            brand.id === id ? { ...brand, ...updates } : brand
          ),
        }));
      },

      deleteBrand: (id) => {
        set((state) => ({
          brands: state.brands.filter((brand) => brand.id !== id),
          users: state.users.filter((user) => user.brandId !== id),
        }));
      },

      getBrand: (id) => {
        return get().brands.find((brand) => brand.id === id);
      },

      getBrandByDbName: (dbname) => {
        return get().brands.find((brand) => brand.dbname === dbname);
      },

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => {
          // Update user count for the brand
          const updatedBrands = state.brands.map((brand) =>
            brand.id === userData.brandId
              ? { ...brand, userCount: brand.userCount + 1 }
              : brand
          );
          
          return {
            users: [...state.users, newUser],
            brands: updatedBrands,
          };
        });
        
        return newUser;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        
        set((state) => {
          // Update user count for the brand
          const updatedBrands = state.brands.map((brand) =>
            brand.id === user?.brandId
              ? { ...brand, userCount: Math.max(0, brand.userCount - 1) }
              : brand
          );
          
          return {
            users: state.users.filter((u) => u.id !== id),
            brands: updatedBrands,
          };
        });
      },

      getUsersByBrand: (brandId) => {
        return get().users.filter((user) => user.brandId === brandId);
      },

      getAllUsers: () => {
        return get().users;
      },

      addMultipleBrands: (brandsData) => {
        const newBrands = brandsData.map((brandData) => ({
          ...brandData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          userCount: 0,
        }));
        
        set((state) => ({
          brands: [...state.brands, ...newBrands],
        }));
        
        return newBrands;
      },

      duplicateBrand: (brandId, newName, newDbName) => {
        const sourceBrand = get().getBrand(brandId);
        if (!sourceBrand) return null;
        
        const duplicatedBrand: Brand = {
          ...sourceBrand,
          id: uuidv4(),
          name: newName,
          dbname: newDbName,
          createdAt: new Date().toISOString(),
          userCount: 0,
        };
        
        set((state) => ({
          brands: [...state.brands, duplicatedBrand],
        }));
        
        return duplicatedBrand;
      },
    }),
    {
      name: 'gms-brand-storage',
    }
  )
);
