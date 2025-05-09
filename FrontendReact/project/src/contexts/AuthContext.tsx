import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserType } from '../types';

type AuthContextType = {
  currentUser: UserType | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (user: Partial<UserType>) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
};

const defaultAuthContext: AuthContextType = {
  currentUser: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAdmin: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Mock validation - in a real app, this would be an API call
        if (email === 'admin@example.com' && password === 'password') {
          const adminUser = {
            id: '1',
            fullName: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            phoneNumber: '123-456-7890',
          };
          setCurrentUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          resolve();
        } else if (email === 'user@example.com' && password === 'password') {
          const candidateUser = {
            id: '2',
            fullName: 'John Doe',
            email: 'user@example.com',
            role: 'candidate',
            phoneNumber: '123-456-7890',
          };
          setCurrentUser(candidateUser);
          localStorage.setItem('user', JSON.stringify(candidateUser));
          resolve();
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const signup = async (user: Partial<UserType>) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: Math.random().toString(36).substring(2, 9),
          fullName: user.fullName || '',
          email: user.email || '',
          role: 'candidate',
          phoneNumber: user.phoneNumber || '',
        };
        setCurrentUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAdmin: currentUser?.role === 'admin',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};