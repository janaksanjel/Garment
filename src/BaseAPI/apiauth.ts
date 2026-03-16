import axios from 'axios';
import { BASE_URL } from './baseurl';
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: number;
      username: string;
      email: string;
      is_staff: boolean;
      is_superuser: boolean;
    };
  };
}

export interface ApiError {
  error: string;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
  dbname: string;
  isActive: boolean;
  moreInfo: {
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    description: string;
    taxId: string;
    website?: string;
  };
}

export interface BrandCreateData {
  name: string;
  logo?: File;
  dbname: string;
  db_user: string;
  db_password: string;
  db_database: string;
  db_host?: string;
  db_port?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  tax_id: string;
  website?: string;
  loginUsername?: string;
  loginPassword?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('igms-auth-token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login/`, credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  getUserData: async (): Promise<any> => {
    const token = localStorage.getItem('igms-auth-token');
    if (!token) throw new Error('No token found');

    try {
      const response = await axios.get(`${BASE_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get user data');
    }
  },

  logout: async (token: string): Promise<void> => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout/`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Logout failed');
    }
  },
};

export const brandAPI = {
  getAll: async (): Promise<Brand[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/brands/`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch brands');
    }
  },

  getById: async (id: number): Promise<Brand> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/brands/${id}/`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch brand');
    }
  },

  create: async (brandData: BrandCreateData): Promise<Brand> => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.entries(brandData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      const response = await axios.post(`${BASE_URL}/api/auth/brands/`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create brand');
    }
  },

  update: async (id: number, brandData: Partial<BrandCreateData>): Promise<Brand> => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.entries(brandData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      const response = await axios.put(`${BASE_URL}/api/auth/brands/${id}/`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update brand');
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/api/auth/brands/${id}/`, {
        headers: getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete brand');
    }
  },

  changeStatus: async (modelType: 'brand' | 'user', id: number, isActive: boolean): Promise<{id: number, is_active: boolean}> => {
    try {
      const response = await axios.patch(`${BASE_URL}/api/auth/change-status/${modelType}/${id}/`, 
        { is_active: isActive },
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change status');
    }
  },
}