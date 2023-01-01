import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import BankOfficerDashboardPage from './pages/BankOfficerDashboardPage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Header from './components/layout/Header';
import { UserRole } from './types';
import LoanRepaymentPage from './pages/LoanRepaymentPage';
import ProfilePage from './pages/ProfilePage';

// Placeholder LoanDetailsPage component
const LoanDetailsPage: React.FC = () => {
  return (
    <div className="container py-4">
      <h2>Loan Details</h2>
      <p>This page will show detailed information about a loan.</p>
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const appName = "Monitoring and Progress Evaluation";
  const currentYear = new Date().getFullYear();

  // Debugging output
  useEffect(() => {
    console.log('Current User:', currentUser);
    console.log('Auth Loading:', authLoading);
    console.log('Current Path:', location.pathname);
  }, [currentUser, authLoading, location.pathname]);

  // Set app name in document title
  useEffect(() => {
    document.title = appName;
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-green-700 text-xl">
          Loading {appName}...
        </div>
      </div>
    );
  }

  // Debugging screen
  if (location.pathname === '/debug') {
    return (
      <div className="p-4">
        <h1>Debug Information</h1>
        <pre>{JSON.stringify({ currentUser, authLoading }, null, 2)}</pre>
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
              <Route path="/auth" element={<AuthPage appName={appName} />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          ) : (
            <>
              {/* Farmer Routes */}
              {currentUser.role === UserRole.FARMER && (
                <>
                  <Route path="/farmer" element={<FarmerDashboardPage />} />
                  <Route path="/farmer/loans/:loanId" element={<LoanDetailsPage />} />
                  <Route path="/farmer/repayment/:loanId" element={<LoanRepaymentPage />} />
                </>
              )}
              
              {/* Bank Officer Routes */}
              {currentUser.role === UserRole.BANK_OFFICER && (
                <>
                  <Route path="/bank" element={<BankOfficerDashboardPage />} />
                  <Route path="/bank/loans/:loanId" element={<LoanDetailsPage />} />
                  <Route path="/bank/repayment/:loanId" element={<LoanRepaymentPage />} />
                </>
              )}
              
              {/* Buyer Routes */}
              {currentUser.role === UserRole.BUYER && (
                <Route path="/buyer" element={<BuyerDashboardPage />} />
              )}
              
              {/* Admin Routes */}
              {currentUser.role === UserRole.ADMIN && (
                <Route path="/admin" element={<AdminDashboardPage />} />
              )}
              
              {/* Profile Route (for all roles) */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Default Redirect */}
              <Route path="/" element={
                currentUser.role === UserRole.FARMER ? <Navigate to="/farmer" /> :
                currentUser.role === UserRole.BANK_OFFICER ? <Navigate to="/bank" /> :
                currentUser.role === UserRole.BUYER ? <Navigate to="/buyer" /> :
                currentUser.role === UserRole.ADMIN ? <Navigate to="/admin" /> :
                <Navigate to="/auth" />
              } />
              
              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </main>
      {currentUser && (
        <footer className="bg-green-700 text-white text-center p-4 text-sm">
          © {currentYear} {appName}. All Rights Reserved. (Simulated Offline/Low-Data Mode)
        </footer>
      )}
    </div>
  );
};

export default App;