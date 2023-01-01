import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME, IconFarm, IconBank, IconBuyer, IconLogout, IconUserCircle, IconAdmin } from '../../constants';
import { UserRole } from '../../types';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case UserRole.FARMER:
        return <IconFarm className="w-5 h-5 mr-1" />;
      case UserRole.BANK_OFFICER:
        return <IconBank className="w-5 h-5 mr-1" />;
      case UserRole.BUYER:
        return <IconBuyer className="w-5 h-5 mr-1" />;
      case UserRole.ADMIN:
        return <IconAdmin className="w-5 h-5 mr-1" />;
      default:
        return <IconUserCircle className="w-5 h-5 mr-1" />;
    }
  };
  
  const getRoleName = (role?: UserRole) => {
    if (!role) return '';
    switch (role) {
      case UserRole.FARMER: return 'Farmer';
      case UserRole.BANK_OFFICER: return 'Bank Officer';
      case UserRole.BUYER: return 'Buyer';
      case UserRole.ADMIN: return 'Admin';
      default: return 'User';
    }
  };

  // Safely get user's name
  const getUserName = () => {
    if (!currentUser) return '';
    
    // First try name property
    if (currentUser.name) return currentUser.name;
    
    // Then try profile.fullName (if your user structure has this)
    if ((currentUser as any).profile?.fullName) {
      return (currentUser as any).profile.fullName;
    }
    
    // Finally, fallback to email/phone
    return currentUser.emailOrPhone || 'User';
  };

  return (
    <header className="bg-green-700 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl md:text-2xl font-bold hover:text-green-200 transition-colors">
          {APP_NAME}
        </Link>
        
        {currentUser && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center text-sm text-green-100 hover:text-white transition-colors p-2 rounded-md hover:bg-green-600"
              title="Profile"
            >
              <IconUserCircle className="w-5 h-5" />
              <span className="ml-1 hidden sm:inline">Profile</span>
            </Link>
            
            {/* User Info */}
            <div className="flex items-center text-sm bg-green-600 px-3 py-1 rounded-md">
              {getRoleIcon()}
              <div className="hidden md:inline">
                <span className="font-medium">{getUserName()}</span>
                <span className="ml-2 text-green-200">({getRoleName(currentUser.role)})</span>
              </div>
              <div className="md:hidden">
                <span>{getUserName().split(' ')[0]}</span>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center text-sm text-green-100 hover:text-white transition-colors p-2 rounded-md hover:bg-green-600"
              title="Logout"
            >
              <IconLogout className="w-5 h-5" />
              <span className="ml-1 hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;