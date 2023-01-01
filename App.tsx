
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import BankOfficerDashboardPage from './pages/BankOfficerDashboardPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage'; // Corrected relative path
import AdminDashboardPage from './pages/AdminDashboardPage'; // Added Admin Dashboard
import Header from './components/layout/Header';
import { UserRole } from './types';
import PageContainer from './components/layout/PageContainer';

const App: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-green-700 text-xl">Loading AgriLoan Connect...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {currentUser && <Header />}
      <main className="flex-grow">
        <Routes>
          {!currentUser ? (
            <>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          ) : (
            <>
              {currentUser.role === UserRole.FARMER && (
                <Route path="/farmer" element={<FarmerDashboardPage />} />
              )}
              {currentUser.role === UserRole.BANK_OFFICER && (
                <Route path="/bank" element={<BankOfficerDashboardPage />} />
              )}
              {currentUser.role === UserRole.BUYER && (
                <Route path="/buyer" element={<BuyerDashboardPage />} />
              )}
              {currentUser.role === UserRole.ADMIN && (
                <Route path="/admin" element={<AdminDashboardPage />} />
              )}
              <Route path="/" element={
                currentUser.role === UserRole.FARMER ? <Navigate to="/farmer" /> :
                currentUser.role === UserRole.BANK_OFFICER ? <Navigate to="/bank" /> :
                currentUser.role === UserRole.BUYER ? <Navigate to="/buyer" /> :
                currentUser.role === UserRole.ADMIN ? <Navigate to="/admin" /> :
                <Navigate to="/auth" />
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>
      {currentUser && (
         <footer className="bg-green-700 text-white text-center p-4 text-sm">
          © 2024 AgriLoan Connect NG. All Rights Reserved. (Simulated Offline/Low-Data Mode)
        </footer>
      )}
    </div>
  );
};

export default App;
