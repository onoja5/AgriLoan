import React, { useState, useEffect } from 'react';
import { LoanApplication, LoanStatus } from '../../types';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import TextArea from '../common/TextArea';
import { formatDate, formatCurrency, getLoanStatusColor } from '../../utils/helpers';
import { IconCheckCircle, IconXCircle, IconClock, IconCalendar, IconInfo } from '../../constants';

interface LoanApprovalCardProps {
  loan: LoanApplication;
}

const LoanApprovalCard: React.FC<LoanApprovalCardProps> = ({ loan }) => {
  const { currentUser } = useAuth();
  const { updateLoan } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [comments, setComments] = useState(loan.officerComments || '');
  // Default approved amount to admin's pre-approved amount if available, else officer's approved, else requested.
  const [approvedAmount, setApprovedAmount] = useState<number | ''>(loan.approvedAmount || loan.preApprovedAmount || loan.requestedAmount);
  const [repaymentDueDate, setRepaymentDueDate] = useState(loan.repaymentDueDate || loan.expectedHarvestDate || '');

  useEffect(() => {
    setComments(loan.officerComments || '');
    setApprovedAmount(loan.approvedAmount || loan.preApprovedAmount || loan.requestedAmount);
    setRepaymentDueDate(loan.repaymentDueDate || loan.expectedHarvestDate || '');
  }, [loan]);


  const handleAction = (type: 'APPROVE' | 'REJECT') => {
    setAction(type);
    setComments(loan.officerComments || '');
    if (type === 'APPROVE') {
        setApprovedAmount(loan.approvedAmount || loan.preApprovedAmount || loan.requestedAmount); 
        const defaultDueDate = loan.repaymentDueDate || loan.expectedHarvestDate || new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        setRepaymentDueDate(defaultDueDate);
    }
    setIsModalOpen(true);
  };

  const submitDecision = () => {
    if (!currentUser || !action) return;

    let updatedStatus: LoanStatus;
    let finalApprovedAmount: number | undefined = undefined;
    let finalRepaymentDueDate: string | undefined = undefined;
    
    if (action === 'APPROVE') {
      if (approvedAmount === '' || Number(approvedAmount) <= 0) {
        alert("Approved amount must be a positive number.");
        return;
      }
      if (!repaymentDueDate) {
        alert("Repayment due date is required for approval.");
        return;
      }
      updatedStatus = LoanStatus.APPROVED;
      finalApprovedAmount = Number(approvedAmount);
      finalRepaymentDueDate = repaymentDueDate;
    } else { // REJECT
      updatedStatus = LoanStatus.REJECTED;
      finalApprovedAmount = undefined; 
      finalRepaymentDueDate = undefined;
    }
    
    updateLoan({
      ...loan,
      status: updatedStatus,
      approvedAmount: finalApprovedAmount,
      repaymentDueDate: finalRepaymentDueDate,
      officerId: currentUser.id,
      officerName: currentUser.profile.fullName, // Will be set by AppData context if not here
      officerComments: comments,
    });
    setIsModalOpen(false);
  };

  let currentDisplayStatus = loan.status;
  let statusColor = getLoanStatusColor(loan.status);

  if (loan.status !== LoanStatus.REPAID && loan.status !== LoanStatus.REJECTED && loan.approvedAmount && loan.repaymentDueDate && new Date() > new Date(loan.repaymentDueDate)) {
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
    if (loan.approvedAmount - totalRepaid > 0) {
      if(currentDisplayStatus !== LoanStatus.OVERDUE){
          currentDisplayStatus = LoanStatus.OVERDUE;
          statusColor = getLoanStatusColor(LoanStatus.OVERDUE);
      }
    }
  }

  const canPerformAction = loan.status === LoanStatus.PENDING_BANK_APPROVAL || loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE;

  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow duration-150 ease-in-out flex flex-col justify-between h-full">
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
            <div>
                <h3 className="text-lg font-semibold text-green-700">{loan.farmerName}</h3>
                <p className="text-sm text-gray-500">Applied for: {loan.cropType} {loan.otherCropType ? `(${loan.otherCropType})` : ''}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} whitespace-nowrap mt-2 sm:mt-0`}>
                {currentDisplayStatus.replace(/_/g, ' ')}
            </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                  <p className="text-gray-500">Amount Req.</p>
                  <p className="font-medium text-gray-800">{formatCurrency(loan.requestedAmount)}</p>
              </div>
              {loan.preApprovedAmount && loan.status === LoanStatus.PENDING_BANK_APPROVAL && (
                <div>
                  <p className="text-gray-500">Admin Pre-Appr.</p>
                  <p className="font-medium text-purple-600">{formatCurrency(loan.preApprovedAmount)}</p>
                </div>
              )}
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
              {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.REPAID || loan.status === LoanStatus.OVERDUE) && loan.approvedAmount && (
                  <div>
                      <p className="text-gray-500">Bank Appr.</p>
                      <p className="font-medium text-green-600">{formatCurrency(loan.approvedAmount)}</p>
                  </div>
              )}
              {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.REPAID || loan.status === LoanStatus.OVERDUE) && loan.repaymentDueDate && (
                  <div>
                      <p className="text-gray-500">Repay By</p>
                      <p className="font-medium text-red-600">{formatDate(loan.repaymentDueDate)}</p>
                  </div>
              )}
            </div>
            
            <p className="text-xs text-gray-600 mb-1 bg-gray-50 p-2 rounded">Needs: {loan.inputNeeds}</p>

            {loan.adminComments && (
              <div className="mt-1 mb-2">
                  <p className="text-xs text-gray-500">Admin Comments ({loan.adminReviewerName || 'N/A'} on {formatDate(loan.adminReviewDate)}):</p>
                  <p className="italic text-gray-700 text-xs bg-purple-50 p-1.5 rounded">{loan.adminComments}</p>
              </div>
            )}
            {loan.officerComments && (
                <div className="mt-1 mb-3">
                    <p className="text-xs text-gray-500">Officer Comments ({loan.officerName || 'N/A'}):</p>
                    <p className="italic text-gray-700 text-xs bg-yellow-50 p-1.5 rounded">{loan.officerComments}</p>
                </div>
            )}
        </div>

        {canPerformAction && (
          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100">
            <Button variant="danger" size="sm" onClick={() => handleAction('REJECT')} leftIcon={<IconXCircle className="w-4 h-4"/>}>
                Reject
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleAction('APPROVE')} leftIcon={<IconCheckCircle className="w-4 h-4"/>}>
              {loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE ? 'Modify' : 'Approve'}
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${action === 'APPROVE' ? (loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE ? 'Modify Approved Loan' : 'Approve Loan Application') : 'Reject Loan Application'}`}>
        <div className="space-y-4">
          <p>
            Applicant: <span className="font-semibold">{loan.farmerName}</span> <br/>
            Requested: <span className="font-semibold">{formatCurrency(loan.requestedAmount)}</span> for <span className="font-semibold">{loan.cropType}</span>. <br/>
            {loan.preApprovedAmount && loan.status === LoanStatus.PENDING_BANK_APPROVAL && 
                <>Admin Pre-Approved: <span className="font-semibold text-purple-600">{formatCurrency(loan.preApprovedAmount)}</span>.<br/></>
            }
            {loan.adminComments && loan.status === LoanStatus.PENDING_BANK_APPROVAL &&
                <>Admin Comments: <i className="text-xs text-purple-700">"{loan.adminComments}"</i></>
            }
          </p>
          {action === 'APPROVE' && (
            <>
            <Input
              label="Bank Approved Amount (NGN)"
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              min="0"
              required
            />
            <Input
                label="Repayment Due Date"
                type="date"
                value={repaymentDueDate}
                onChange={(e) => setRepaymentDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </>
          )}
          <TextArea
            label={`Bank Officer Comments ${action === 'REJECT' ? '(Required for Rejection)' : '(Recommended for Approval/Modification)'}`}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder={action === 'REJECT' ? "Reason for rejection..." : "Approval conditions, notes..."}
            required={action === 'REJECT'}
          />
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
                variant={action === 'APPROVE' ? 'primary' : 'danger'} 
                onClick={submitDecision}
                leftIcon={action === 'APPROVE' ? <IconCheckCircle className="w-4 h-4"/> : <IconXCircle className="w-4 h-4"/>}
                disabled={action === 'REJECT' && !comments.trim()}
            >
              Confirm {action}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LoanApprovalCard;