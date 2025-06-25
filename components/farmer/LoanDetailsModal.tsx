
import React, { useState } from 'react';
import { LoanApplication, Repayment, LoanStatus } from '../../types';
import Modal from '../common/Modal';
import RepaymentForm from './RepaymentForm';
import Button from '../common/Button';
import { formatDate, formatCurrency, getLoanStatusColor } from '../../utils/helpers';
import { IconCalendar, IconCheckCircle, IconClock } from '../../constants';

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanApplication | null;
}

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ isOpen, onClose, loan }) => {
  const [showRepaymentForm, setShowRepaymentForm] = useState(false);

  if (!isOpen || !loan) return null;

  const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
  const remainingBalance = (loan.approvedAmount || 0) - totalRepaid;
  const isFullyRepaid = loan.status === LoanStatus.REPAID || ((loan.approvedAmount || 0) > 0 && remainingBalance <= 0) ;


  const handleRepaymentSuccess = () => {
    setShowRepaymentForm(false);
    // The main loan list will re-render due to context update, so no need to refresh here
  };
  
  let displayStatus: LoanStatus | string = loan.status;
  let displayStatusColor = getLoanStatusColor(loan.status);

  if (loan.status !== LoanStatus.REPAID && loan.status !== LoanStatus.REJECTED && loan.repaymentDueDate && new Date() > new Date(loan.repaymentDueDate) && remainingBalance > 0) {
      if(loan.status !== LoanStatus.OVERDUE) { 
        displayStatus = LoanStatus.OVERDUE;
        displayStatusColor = getLoanStatusColor(LoanStatus.OVERDUE);
      }
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Loan Details: ${loan.cropType}`} size="lg">
      <div className="space-y-4">
        {/* Loan Summary */}
        <div className="p-3 bg-gray-50 rounded-md border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-lg font-semibold text-green-700">{loan.cropType} Loan</h4>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${displayStatusColor}`}>
              {displayStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <p><strong>Farmer:</strong> {loan.farmerName}</p>
            <p><strong>Application Date:</strong> {formatDate(loan.applicationDate)}</p>
            <p><strong>Requested Amount:</strong> {formatCurrency(loan.requestedAmount)}</p>
            {loan.approvedAmount !== undefined && <p><strong>Approved Amount:</strong> {formatCurrency(loan.approvedAmount)}</p>}
            {loan.repaymentDueDate && <p><strong>Repayment Due:</strong> {formatDate(loan.repaymentDueDate)}</p>}
            {loan.officerName && <p><strong>Processed by:</strong> {loan.officerName}</p>}
            {loan.officerComments && <p className="col-span-2"><strong>Officer Comments:</strong> <span className="italic text-gray-600">"{loan.officerComments}"</span></p>}
            <p className="col-span-2"><strong>Input Needs:</strong> {loan.inputNeeds}</p>
          </div>
        </div>

        {/* Repayments Section */}
        {![LoanStatus.PENDING_ADMIN_REVIEW, LoanStatus.PENDING_BANK_APPROVAL, LoanStatus.REJECTED].includes(loan.status) && (
          <div className="p-3 bg-green-50 rounded-md border border-green-200">
            <h5 className="text-md font-semibold text-green-700 mb-2">Repayment History</h5>
            {loan.repayments.length > 0 ? (
              <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                {loan.repayments.map((repayment: Repayment) => (
                  <li key={repayment.id} className="flex justify-between p-1.5 bg-white rounded shadow-sm">
                    <span>{formatDate(repayment.date)}</span>
                    <span className="font-semibold">{formatCurrency(repayment.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No repayments made yet.</p>
            )}
            <div className="mt-2 pt-2 border-t border-green-300 text-sm">
              <p><strong>Total Repaid:</strong> {formatCurrency(totalRepaid)}</p>
              <p className="font-semibold">
                <strong>Remaining Balance:</strong> 
                <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                  {' '}{formatCurrency(remainingBalance)}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Area */}
        {showRepaymentForm ? (
          <RepaymentForm loan={loan} onRepaymentSuccess={handleRepaymentSuccess} onClose={() => setShowRepaymentForm(false)} />
        ) : (
          <div className="flex justify-end space-x-2 pt-3">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.OVERDUE) && !isFullyRepaid && (
              <Button variant="primary" onClick={() => setShowRepaymentForm(true)}>
                Make Repayment
              </Button>
            )}
             {isFullyRepaid && ![LoanStatus.PENDING_ADMIN_REVIEW, LoanStatus.PENDING_BANK_APPROVAL, LoanStatus.REJECTED].includes(loan.status) && (
                <p className="text-green-600 font-semibold flex items-center p-2 bg-green-100 rounded-md">
                    <IconCheckCircle className="w-5 h-5 mr-2"/> Loan Fully Repaid
                </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LoanDetailsModal;
