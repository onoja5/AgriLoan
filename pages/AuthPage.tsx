import React, { useState, useEffect } from 'react';
import AuthForm from '../components/auth/AuthForm';
import { APP_NAME } from '../constants';

const AuthPage: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className={`absolute -top-20 -right-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-soft-light opacity-30 transition-all duration-1000 ${animate ? 'scale-100' : 'scale-0'}`}></div>
      <div className={`absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400 rounded-full mix-blend-soft-light opacity-30 transition-all duration-1000 delay-300 ${animate ? 'scale-100' : 'scale-0'}`}></div>
      
      {/* Main content */}
      <div className={`z-10 flex flex-col items-center mb-8 transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center text-white mb-4">
          <svg className="w-14 h-14 mr-3 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 11L12 15L16 11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 13C3 9.22876 3 7.34315 4.17157 6.17157C5.34315 5 7.22876 5 11 5H13C16.7712 5 18.6569 5 19.8284 6.17157C21 7.34315 21 9.22876 21 13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13Z" strokeWidth="2"/>
            <path d="M7 17H17" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">
            {APP_NAME}
          </h1>
        </div>
        <p className="text-green-100 text-lg italic max-w-md text-center text-shadow">
          Growing connections, cultivating prosperity
        </p>
      </div>

      {/* Auth card - Using your original AuthForm component */}
      <div className={`z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <AuthForm 
          isRegisterMode={isRegisterMode} 
          setIsRegisterMode={setIsRegisterMode} 
          // Pass custom class for the button
          buttonClass="w-full py-3.5 px-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
        />
      </div>

      {/* Footer with copyright and love */}
      <footer className="z-10 text-center mt-8">
        <p className="text-green-100 text-sm mb-2 flex items-center justify-center">
          Connecting Agriculture in Nigeria 
          <span className="mx-2 text-red-400">❤️</span> 
          Simple, Secure, Efficient
        </p>
        <p className="text-green-100 text-xs opacity-80">
          Copyright © 2024, developed with passion by: 
          <br />
          Michael Onoja, Akeem Akintoye, Cynthia Onyenze for Heritage Bank
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;