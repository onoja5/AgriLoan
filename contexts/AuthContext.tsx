
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { useAppData } from './AppDataContext'; // To access users array

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (emailOrPhone: string, passwordAttempt: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { users, addUser, generateId } = useAppData(); // Assuming AppDataContext provides this

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone: string, passwordAttempt: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = users.find(u => u.emailOrPhone === emailOrPhone && u.password === passwordAttempt); // Simplified password check
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const register = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingUser = users.find(u => u.emailOrPhone === userData.emailOrPhone);
    if (existingUser) {
      setLoading(false);
      // alert('User with this email/phone already exists.');
      return null; // Indicate failure
    }
    
    const newUser: User = {
      ...userData,
      id: generateId(),
    };
    addUser(newUser); // Add to AppDataContext's users list
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
