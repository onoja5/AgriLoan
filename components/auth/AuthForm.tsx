
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, UserProfile } from '../../types'; // Corrected import statement
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { IconFarm, IconBank, IconBuyer, IconUserCircle } from '../../constants';

interface AuthFormProps {
  isRegisterMode: boolean;
  setIsRegisterMode: (isRegister: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isRegisterMode, setIsRegisterMode }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.FARMER);
  const [entityName, setEntityName] = useState(''); // Farm name, Bank name, or Company name
  const [error, setError] = useState<string | null>(null);
  const { login, register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegisterMode) {
      if (!emailOrPhone || !password || !fullName || !role || (role !== UserRole.BANK_OFFICER && !entityName)) {
        setError('All fields are required for registration.');
        return;
      }
      const profile: UserProfile = { fullName };
      if (role === UserRole.FARMER) profile.farmName = entityName;
      else if (role === UserRole.BANK_OFFICER) profile.bankName = entityName || 'N/A'; // Bank name optional for simplicity here
      else if (role === UserRole.BUYER) profile.companyName = entityName;

      const success = await register({ emailOrPhone, password, role, profile });
      if (!success) {
        setError('Registration failed. User may already exist or an error occurred.');
      }
    } else {
      if (!emailOrPhone || !password) {
        setError('Email/Phone and password are required to login.');
        return;
      }
      const success = await login(emailOrPhone, password);
      if (!success) {
        setError('Login failed. Invalid credentials.');
      }
    }
  };
  
  const roleOptions = [
    { value: UserRole.FARMER, label: 'Farmer' },
    { value: UserRole.BANK_OFFICER, label: 'Bank Officer' },
    { value: UserRole.BUYER, label: 'Buyer (Agribusiness)' },
  ];

  const getEntityNameLabel = () => {
    switch(role) {
      case UserRole.FARMER: return 'Farm Name';
      case UserRole.BANK_OFFICER: return 'Bank Name (Optional)';
      case UserRole.BUYER: return 'Company Name';
      default: return 'Entity Name';
    }
  };

  const getRoleIcon = () => {
    switch(role) {
      case UserRole.FARMER: return <IconFarm className="w-5 h-5 text-gray-400" />;
      case UserRole.BANK_OFFICER: return <IconBank className="w-5 h-5 text-gray-400" />;
      case UserRole.BUYER: return <IconBuyer className="w-5 h-5 text-gray-400" />;
      default: return <IconUserCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white shadow-xl rounded-lg border border-green-200">
      <h2 className="text-3xl font-bold text-center text-green-700">
        {isRegisterMode ? 'Create Account' : 'Welcome Back!'}
      </h2>
      
      {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

      <Input
        id="emailOrPhone"
        label="Email or Phone Number"
        type="text"
        value={emailOrPhone}
        onChange={(e) => setEmailOrPhone(e.target.value)}
        placeholder="e.g., user@example.com or 08012345678"
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      {isRegisterMode && (
        <>
          <Input
            id="fullName"
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Aisha Bello"
            required
          />
          <Select
            id="role"
            label="I am a..."
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
            required
          />
           <Input
            id="entityName"
            label={getEntityNameLabel()}
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder={`Enter your ${getEntityNameLabel().toLowerCase()}`}
            required={role !== UserRole.BANK_OFFICER} // Optional for bank officer
            icon={getRoleIcon()}
          />
        </>
      )}

      <Button type="submit" className="w-full" isLoading={loading} variant="primary" size="lg">
        {isRegisterMode ? 'Register' : 'Login'}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => { setIsRegisterMode(!isRegisterMode); setError(null); }}
          className="font-medium text-green-600 hover:text-green-500"
        >
          {isRegisterMode ? 'Login here' : 'Register now'}
        </button>
      </p>
    </form>
  );
};

export default AuthForm;