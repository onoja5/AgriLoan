import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { useAppData } from './AppDataContext';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (emailOrPhone: string, passwordAttempt: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<User | null>;
  logout: () => void;
  updateProfile: (updatedUserData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { users, addUser, generateId, updateUsers } = useAppData();

  // Check for existing session on app load
  useEffect(() => {
    const verifySession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      const sessionToken = localStorage.getItem('sessionToken');
      const sessionExpiry = localStorage.getItem('sessionExpiry');

      if (storedUser && sessionToken && sessionExpiry) {
        const user = JSON.parse(storedUser);
        const expiryTime = parseInt(sessionExpiry, 10);
        
        // Check if session is still valid
        if (Date.now() < expiryTime) {
          // Verify user exists in the system
          const userExists = users.some(u => u.id === user.id);
          
          if (userExists) {
            setCurrentUser(user);
            // Refresh session
            localStorage.setItem('sessionExpiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
          } else {
            clearSession();
          }
        } else {
          clearSession();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [users]);

  const clearSession = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('sessionExpiry');
    setCurrentUser(null);
  };

  const createSession = (user: User) => {
    const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('sessionToken', generateSessionToken());
    localStorage.setItem('sessionExpiry', (Date.now() + sessionDuration).toString());
    setCurrentUser(user);
  };

  const generateSessionToken = () => {
    return 'tok_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
  };

  const login = async (emailOrPhone: string, passwordAttempt: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => 
      u.emailOrPhone === emailOrPhone && 
      u.password === passwordAttempt
    );

    if (user) {
      createSession(user);
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const register = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = users.find(u => u.emailOrPhone === userData.emailOrPhone);
    if (existingUser) {
      setLoading(false);
      return null;
    }
    
    const newUser: User = {
      ...userData,
      id: generateId(),
    };
    
    addUser(newUser);
    createSession(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = () => {
    clearSession();
  };

  const updateProfile = async (updatedUserData: Partial<User>): Promise<boolean> => {
    if (!currentUser) {
      console.error('Cannot update profile: No current user');
      return false;
    }
    
    try {
      setLoading(true);
      console.log('Starting profile update for:', currentUser.id);
      
      // Create updated user object
      const updatedUser = { ...currentUser, ...updatedUserData };
      
      // Directly update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      console.log('User updated in localStorage');
      
      // Update current user state
      setCurrentUser(updatedUser);
      console.log('Current user state updated');
      
      // Update global users list
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      
      if (updateUsers) {
        updateUsers(updatedUsers);
        console.log('Global users list updated');
      } else {
        console.warn('updateUsers function not available');
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      setLoading(false);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) {
      console.error('Cannot change password: No current user');
      return false;
    }
    
    // Verify current password matches
    if (currentUser.password !== currentPassword) {
      console.warn('Password change failed: Current password incorrect');
      return false;
    }
    
    try {
      setLoading(true);
      console.log('Changing password for:', currentUser.id);
      
      // Create updated user object
      const updatedUser = { ...currentUser, password: newPassword };
      
      // Directly update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      console.log('Password updated in localStorage');
      
      // Update current user state
      setCurrentUser(updatedUser);
      console.log('Current user state updated');
      
      // Update global users list
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      
      if (updateUsers) {
        updateUsers(updatedUsers);
        console.log('Global users list updated');
      } else {
        console.warn('updateUsers function not available');
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      setLoading(false);
      return false;
    }
  };

  // Auto-logout when session expires
  useEffect(() => {
    const sessionChecker = setInterval(() => {
      const expiry = localStorage.getItem('sessionExpiry');
      if (expiry && Date.now() > parseInt(expiry, 10)) {
        clearSession();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(sessionChecker);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      register, 
      logout,
      updateProfile,
      changePassword 
    }}>
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