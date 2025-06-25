import React, { useState, useEffect } from 'react';
import { LoanApplication, LoanStatus } from '../../types';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import { formatDate, formatCurrency, getLoanStatusColor } from '../../utils/helpers';
import { IconCheckCircle, IconXCircle, IconSend } from '../../constants';

interface AdminLoanReviewCardProps {
  loan: LoanApplication;
}

const AdminLoanReviewCard: React.FC<AdminLoanReviewCardProps> = ({ loan }) => {
  const { currentUser } = useAuth();
  const { updateLoan } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<'FORWARD' | 'REJECT' | null>(null);
  const [adminComments, setAdminComments] = useState(loan.adminComments || '');
  const [preApprovedAmount, setPreApprovedAmount] = useState<number | ''>(loan.preApprovedAmount || loan.requestedAmount);

  useEffect(() => {
    setAdminComments(loan.adminComments || '');
    setPreApprovedAmount(loan.preApprovedAmount || loan.requestedAmount);
  }, [loan]);

  const handleAction = (type: 'FORWARD' | 'REJECT') => {
    setAction(type);
    setAdminComments(loan.adminComments || '');
    if (type === 'FORWARD') {
      setPreApprovedAmount(loan.preApprovedAmount || loan.requestedAmount);
    }
    setIsModalOpen(true);
  };

  const submitDecision = () => {
    if (!currentUser || !action) return;

    let updatedStatus: LoanStatus;
    let finalAdminComments = adminComments.trim();
    let finalPreApprovedAmount: number | undefined = undefined;

    if (action === 'FORWARD') {
      if (preApprovedAmount === '' || Number(preApprovedAmount) <= 0) {
        alert("Pre-approved amount must be a positive number.");
        return;
      }
      updatedStatus = LoanStatus.PENDING_BANK_APPROVAL;
      finalPreApprovedAmount = Number(preApprovedAmount);
    } else { // REJECT
      if (!finalAdminComments) {
        alert("Comments are required for rejection.");
        return;
      }
      updatedStatus = LoanStatus.REJECTED;
    }
    
    updateLoan({
      ...loan,
      status: updatedStatus,
      preApprovedAmount: finalPreApprovedAmount,
      adminComments: finalAdminComments,
      adminReviewerId: currentUser.id,
      adminReviewerName: currentUser.profile.fullName,
      adminReviewDate: new Date().toISOString(),
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow duration-150 ease-in-out flex flex-col justify-between h-full">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-green-700">{loan.farmerName}</h3>
              <p className="text-sm text-gray-500">Applied for: {loan.cropType} {loan.otherCropType ? `(${loan.otherCropType})` : ''}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getLoanStatusColor(loan.status)} whitespace-nowrap mt-2 sm:mt-0`}>
              {loan.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
            <div>
              <p className="text-gray-500">Amount Req.</p>
              <p className="font-medium text-gray-800">{formatCurrency(loan.requestedAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500">Farm Size</p>
              <p className="font-medium text-gray-800">{loan.farmSizeAcres} Acres</p>
            </div>
            <div>
              <p className="text-gray-500">Applied On</p>
              <p className="font-medium text-gray-800">{formatDate(loan.applicationDate)}</p>
            </div>
            {loan.expectedHarvestDate && (
              <div>
                <p className="text-gray-500">Exp. Harvest</p>
                <p className="font-medium text-gray-800">{formatDate(loan.expectedHarvestDate)}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">Input Needs: {loan.inputNeeds}</p>
        </div>

        {loan.status === LoanStatus.PENDING_ADMIN_REVIEW && (
          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100">
            <Button variant="danger" size="sm" onClick={() => handleAction('REJECT')} leftIcon={<IconXCircle className="w-4 h-4"/>}>
              Reject
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleAction('FORWARD')} leftIcon={<IconSend className="w-4 h-4"/>}>
              Forward to Bank
            </Button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={action === 'FORWARD' ? 'Forward Loan for Bank Approval' : 'Reject Loan Application'}
      >
        <div className="space-y-4">
          <p>
            Applicant: <span className="font-semibold">{loan.farmerName}</span> <br/>
            Requested: <span className="font-semibold">{formatCurrency(loan.requestedAmount)}</span> for <span className="font-semibold">{loan.cropType}</span>.
          </p>
          {action === 'FORWARD' && (
            <Input
              label="Pre-Approved Amount (NGN)"
              type="number"
              value={preApprovedAmount}
              onChange={(e) => setPreApprovedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              min="0"
              required
            />
          )}
          <TextArea
            label={`Admin Comments ${action === 'REJECT' ? '(Required for Rejection)' : '(Recommended for Forwarding)'}`}
            value={adminComments}
            onChange={(e) => setAdminComments(e.target.value)}
            rows={3}
            placeholder={action === 'REJECT' ? "Reason for rejection..." : "Notes for bank officer..."}
            required={action === 'REJECT'}
          />
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant={action === 'FORWARD' ? 'primary' : 'danger'} 
              onClick={submitDecision}
              leftIcon={action === 'FORWARD' ? <IconSend className="w-4 h-4"/> : <IconXCircle className="w-4 h-4"/>}
              disabled={action === 'REJECT' && !adminComments.trim()}
            >
              Confirm {action === 'FORWARD' ? 'Forward' : 'Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminLoanReviewCard;