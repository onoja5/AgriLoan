import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getLoanDetails, submitRepayment } from '../services/loanService';

const LoanRepaymentPage: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const loanData = await getLoanDetails(loanId!);
        setLoan(loanData);
      } catch (err) {
        setError('Failed to load loan details');
      }
    };
    
    if (loanId) fetchLoan();
  }, [loanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await submitRepayment(loanId!, parseFloat(amount), currentUser!.id);
      navigate(`/${currentUser!.role.toLowerCase()}/loans/${loanId}`);
    } catch (err) {
      setError('Failed to process payment');
      setLoading(false);
    }
  };

  if (!loan) return <div className="text-center py-8">Loading loan details...</div>;

  const repaymentProgress = (loan.paidAmount / loan.totalAmount) * 100;
  const remainingAmount = loan.totalAmount - loan.paidAmount;

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Loan Repayment</h2>
      
      {/* Loan Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-700 mb-3">{loan.purpose}</h3>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="font-medium">Total Amount:</span>
            <span className="font-bold">₦{loan.totalAmount.toLocaleString()}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-green-600 h-4 rounded-full" 
              style={{ width: `${repaymentProgress}%` }}
            >
              <div className="text-xs text-white text-center pt-0.5">
                {repaymentProgress.toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="font-medium">Paid:</span>
            <span className="text-green-600 font-bold">₦{loan.paidAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="font-medium">Remaining:</span>
            <span className="text-red-600 font-bold">₦{remainingAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Due Date:</span>
            <span className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-700 mb-4">Make Payment</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Payment Amount (₦)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={remainingAmount}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum payment: ₦{remainingAmount.toLocaleString()}
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing Payment...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoanRepaymentPage;