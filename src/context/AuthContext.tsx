import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
    phone?: string;
    location?: string;
    address?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('farmlink_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const activeToken = token || localStorage.getItem('farmlink_token');
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    };
  }, [token]);

  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem('farmlink_token');
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('farmlink_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load authenticated user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Login failed. Please check credentials.', 'error');
        return { success: false, error: data.error };
      }

      localStorage.setItem('farmlink_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (err: any) {
      const errorMsg = 'Network error during login. Please try again.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'buyer' | 'seller';
    phone?: string;
    location?: string;
    address?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Registration failed.', 'error');
        return { success: false, error: resData.error };
      }

      localStorage.setItem('farmlink_token', resData.token);
      setToken(resData.token);
      setUser(resData.user);
      showToast('Account created successfully!', 'success');
      return { success: true };
    } catch (err: any) {
      const errorMsg = 'Network error during registration.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('farmlink_token');
    setToken(null);
    setUser(null);
    showToast('You have been signed out.', 'info');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || 'Failed to update profile.', 'error');
        return { success: false, error: resData.error };
      }

      setUser(resData.user);
      showToast('Profile updated successfully!', 'success');
      return { success: true };
    } catch (err: any) {
      showToast('Network error updating profile.', 'error');
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
