'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '@/libs/auth/auth-service';
import { AuthUser } from '@/types/Users';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
    redirectUrl?: string | null;
    data?: AuthUser;
  }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user saat component mount
  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * Fetch current user dari server
   */
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      console.log('Fetched user:', currentUser);
      setUser(currentUser as AuthUser);
    } catch (error) {
      // console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });
      // console.log('Login result:', result);

      if (result.success && result.user) {
        setUser(result.user);
        return {
          success: true,
          message: result.message,
          redirectUrl: result.redirectUrl,
          data: result.user
        };
      }


      return { success: false, message: result.message, redirectUrl: result.redirectUrl, data: result.user };
    } catch (error) {
      // console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login gagal',
      };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      const { success } = await authService.logout();
      if (!success) {
        throw new Error('Logout failed');
      }
      setUser(null);
    } catch (error) {
      // console.error('Logout error:', error);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook untuk menggunakan AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Export default untuk kemudahan import
export default AuthProvider;