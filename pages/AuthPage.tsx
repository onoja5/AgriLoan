
import React, { useState } from 'react';
import AuthForm from '../components/auth/AuthForm';
import { APP_NAME, IconFarm } from '../constants';

const AuthPage: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 via-green-400 to-teal-500 p-4">
      <div className="flex items-center text-white mb-8">
        <IconFarm className="w-12 h-12 mr-3" />
        <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
      </div>
      <div className="w-full max-w-md">
        <AuthForm isRegisterMode={isRegisterMode} setIsRegisterMode={setIsRegisterMode} />
      </div>
      <p className="text-center text-xs text-green-100 mt-8">
        Connecting Agriculture in Nigeria. Simple, Secure, Efficient.
      </p>
    </div>
  );
};

export default AuthPage;
