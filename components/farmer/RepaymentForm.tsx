import React, { useState } from 'react';
import { useAppData } from '../../contexts/AppDataContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { LoanApplication } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface RepaymentFormProps {
  loan: LoanApplication;
  onRepaymentSuccess: () => void;
  onClose: () => void;
}

const RepaymentForm: React.FC<RepaymentFormProps> = ({ loan, onRepaymentSuccess, onClose }) => {
  const { addRepayment } = useAppData();
  const [amount, setAmount] = useState<number | ''>('');
  const [repaymentDate, setRepaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
  const remainingBalance = (loan.approvedAmount || 0) - totalRepaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount === '' || Number(amount) <= 0) {
      setError('Please enter a valid repayment amount.');
      return;
    }
    if (Number(amount) > remainingBalance) {
      setError(`Repayment amount cannot exceed remaining balance of ${formatCurrency(remainingBalance)}.`);
      return;
    }
    if (!repaymentDate) {
      setError('Please select a repayment date.');
      return;
    }

    const success = addRepayment(loan.id, Number(amount), repaymentDate);
    if (success) {
      onRepaymentSuccess();
    } else {
      setError('Failed to record repayment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      
      <p className="text-sm">
        Loan for: <span className="font-semibold">{loan.cropType}</span><br/>
        Approved Amount: <span className="font-semibold">{formatCurrency(loan.approvedAmount)}</span><br/>
        Total Repaid: <span className="font-semibold">{formatCurrency(totalRepaid)}</span><br/>
        Remaining Balance: <span className="font-semibold text-red-600">{formatCurrency(remainingBalance)}</span>
      </p>

      <Input
        label="Repayment Amount (NGN)"
        type="number"
        id="repaymentAmount"
        value={amount}
        onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
        min="1"
        max={remainingBalance > 0 ? remainingBalance : undefined}
        step="any"
        required
        disabled={remainingBalance <= 0}
      />
      <Input
        label="Repayment Date"
        type="date"
        id="repaymentDate"
        value={repaymentDate}
        onChange={(e) => setRepaymentDate(e.target.value)}
        max={new Date().toISOString().split('T')[0]} // Cannot be future date
        required
        disabled={remainingBalance <= 0}
      />
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={remainingBalance <= 0 || amount === '' || Number(amount) <= 0}>
          Record Repayment
        </Button>
      </div>
    </form>
  );
};

export default RepaymentForm;