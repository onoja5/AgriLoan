
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import PageContainer from '../components/layout/PageContainer';
import LoanApprovalCard from '../components/bank/LoanApprovalCard';
import { LoanApplication, LoanStatus } from '../types';
import { IconBank, IconDocumentText, IconCheckCircle, IconXCircle, IconClock, IconCalendar } from '../constants';
import { formatCurrency, formatDate } from '../utils/helpers';

// Define StatCardProps and StatCard component
interface StatCardProps {
  title: string;
  value: string | number;
  color?: 'yellow' | 'blue' | 'green' | 'purple' | 'gray' | 'red' | 'orange' | 'indigo' | 'teal'; // Added 'teal'
  icon?: React.ReactNode;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'gray', icon, subtext }) => {
  const colorClasses = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', value: 'text-gray-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', value: 'text-yellow-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', value: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-800', value: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', value: 'text-purple-600' },
    red: { bg: 'bg-red-100', text: 'text-red-800', value: 'text-red-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', value: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', value: 'text-indigo-600' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-800', value: 'text-teal-600' }, // Added teal color style
  };
  const selectedColor = colorClasses[color] || colorClasses.gray;

  return (
    <div className={`p-4 rounded-lg shadow ${selectedColor.bg}`}>
      <div className="flex items-center">
        {icon && <span className={`mr-2 ${selectedColor.text}`}>{icon}</span>}
        <h4 className={`text-sm font-medium ${selectedColor.text}`}>{title}</h4>
      </div>
      <p className={`text-2xl font-semibold mt-1 ${selectedColor.value}`}>{value}</p>
      {subtext && <p className={`text-xs mt-0.5 ${selectedColor.value} opacity-80`}>{subtext}</p>}
    </div>
  );
};


const BankOfficerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { loans, getUserById } = useAppData();

  // Default filter to PENDING_BANK_APPROVAL
  const [filterStatus, setFilterStatus] = useState<LoanStatus | 'ALL'>(LoanStatus.PENDING_BANK_APPROVAL);

  if (!currentUser) return null;

  const filteredLoans = useMemo(() => {
    let sortedLoans = [...loans].sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
    if (filterStatus === 'ALL') {
      return sortedLoans;
    }
    return sortedLoans.filter(loan => {
        if (filterStatus === LoanStatus.OVERDUE) { 
            const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
            const remainingBalance = (loan.approvedAmount || 0) - totalRepaid;
            return loan.status !== LoanStatus.REPAID && loan.status !== LoanStatus.REJECTED && loan.repaymentDueDate && new Date() > new Date(loan.repaymentDueDate) && remainingBalance > 0;
        }
        return loan.status === filterStatus;
    });
  }, [loans, filterStatus]);
  
  const loanStats = useMemo(() => {
    const totalApplications = loans.length;
    // Count PENDING_ADMIN_REVIEW as overall pending from system perspective
    const pendingAdminReview = loans.filter(l => l.status === LoanStatus.PENDING_ADMIN_REVIEW).length;
    // Count PENDING_BANK_APPROVAL as actionable for bank officer
    const pendingBankApproval = loans.filter(l => l.status === LoanStatus.PENDING_BANK_APPROVAL).length;
    const approvedOrActive = loans.filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.ACTIVE);
    const rejected = loans.filter(l => l.status === LoanStatus.REJECTED).length;
    const repaidLoans = loans.filter(l => l.status === LoanStatus.REPAID);

    const totalValueDisbursed = approvedOrActive.reduce((sum, l) => sum + (l.approvedAmount || 0), 0);
    const totalExpectedFromRepayments = totalValueDisbursed; 

    const totalValueRepaid = loans.reduce((sum, l) => {
        return sum + l.repayments.reduce((repaymentSum, r) => repaymentSum + r.amount, 0);
    }, 0);
    
    const recoveryRate = totalValueDisbursed > 0 ? (totalValueRepaid / totalValueDisbursed) * 100 : 0;

    let overdueCount = 0;
    let totalOverdueAmount = 0;
    loans.forEach(l => {
        if (l.status !== LoanStatus.REPAID && l.status !== LoanStatus.REJECTED && l.approvedAmount && l.repaymentDueDate && new Date() > new Date(l.repaymentDueDate)) {
            const totalRepaidForLoan = l.repayments.reduce((sum, r) => sum + r.amount, 0);
            const remaining = l.approvedAmount - totalRepaidForLoan;
            if (remaining > 0) {
                overdueCount++;
                totalOverdueAmount += remaining;
            }
        }
    });
    
    return { 
        totalApplications, 
        pendingAdminReview, // Overall pending
        pendingBankApproval, // Actionable for bank officer
        approved: approvedOrActive.length, 
        rejected, 
        repaid: repaidLoans.length, 
        totalValueDisbursed, 
        totalExpectedFromRepayments,
        totalValueRepaid,
        recoveryRate,
        overdueCount,
        totalOverdueAmount
    };
  }, [loans]);

  const loanStatusFilters: {label: string; value: LoanStatus | 'ALL' | 'OVERDUE_FILTER' | 'PENDING_ADMIN_REVIEW_FILTER'; icon: React.ReactNode}[] = [
    { label: 'Pending Bank Approval', value: LoanStatus.PENDING_BANK_APPROVAL, icon: <IconClock className="w-4 h-4 mr-1 text-indigo-500"/> },
    { label: 'Pending Admin Review', value: 'PENDING_ADMIN_REVIEW_FILTER' as any, icon: <IconClock className="w-4 h-4 mr-1 text-purple-500"/> },
    { label: 'Approved', value: LoanStatus.APPROVED, icon: <IconCheckCircle className="w-4 h-4 mr-1 text-blue-500"/> },
    { label: 'Active', value: LoanStatus.ACTIVE, icon: <IconCheckCircle className="w-4 h-4 mr-1 text-green-500"/> },
    { label: 'Overdue', value: 'OVERDUE_FILTER' as any, icon: <IconClock className="w-4 h-4 mr-1 text-orange-500"/> },
    { label: 'Repaid', value: LoanStatus.REPAID, icon: <IconCheckCircle className="w-4 h-4 mr-1 text-teal-500"/> },
    { label: 'Rejected', value: LoanStatus.REJECTED, icon: <IconXCircle className="w-4 h-4 mr-1 text-red-500"/> },
    { label: 'All Loans', value: 'ALL', icon: <IconDocumentText className="w-4 h-4 mr-1"/> },
  ];
  
  const handleFilterChange = (value: any) => {
    if (value === 'OVERDUE_FILTER') setFilterStatus(LoanStatus.OVERDUE);
    else if (value === 'PENDING_ADMIN_REVIEW_FILTER') setFilterStatus(LoanStatus.PENDING_ADMIN_REVIEW);
    else setFilterStatus(value as LoanStatus | 'ALL');
  }

  return (
    <PageContainer title="Bank Officer Dashboard" titleIcon={<IconBank className="w-8 h-8"/>}>
      {/* Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Applications" value={loanStats.totalApplications.toString()} icon={<IconDocumentText className="w-5 h-5"/>} />
        <StatCard title="Pending Your Approval" value={loanStats.pendingBankApproval.toString()} color="indigo" icon={<IconClock className="w-5 h-5"/>} />
        <StatCard title="Pending Admin Review" value={loanStats.pendingAdminReview.toString()} color="purple" icon={<IconClock className="w-5 h-5"/>} />
        <StatCard title="Approved/Active" value={loanStats.approved.toString()} color="blue" icon={<IconCheckCircle className="w-5 h-5"/>} />
        <StatCard title="Total Disbursed" value={formatCurrency(loanStats.totalValueDisbursed)} color="green" icon={<IconBank className="w-5 h-5"/>} />
        <StatCard title="Total Repaid" value={formatCurrency(loanStats.totalValueRepaid)} color="teal" icon={<IconCheckCircle className="w-5 h-5"/>} />
        <StatCard title="Recovery Rate" value={`${loanStats.recoveryRate.toFixed(1)}%`} color={loanStats.recoveryRate > 75 ? "green" : loanStats.recoveryRate > 50 ? "yellow" : "orange"} />
        <StatCard title="Overdue Loans" value={loanStats.overdueCount.toString()} color="orange" icon={<IconClock className="w-5 h-5"/>} subtext={`Total: ${formatCurrency(loanStats.totalOverdueAmount)}`} />
        <StatCard title="Rejected Loans" value={loanStats.rejected.toString()} color="red" icon={<IconXCircle className="w-5 h-5"/>} />
      </div>

      {/* Loan Applications List */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-800">Loan Applications Review</h2>
            <div className="flex space-x-2 overflow-x-auto py-2">
                {loanStatusFilters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => handleFilterChange(f.value)}
                        className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full flex items-center transition-colors whitespace-nowrap
                            ${(filterStatus === f.value || 
                              (filterStatus === LoanStatus.OVERDUE && f.value === 'OVERDUE_FILTER') ||
                              (filterStatus === LoanStatus.PENDING_ADMIN_REVIEW && f.value === 'PENDING_ADMIN_REVIEW_FILTER') 
                             ) ? 
                                'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                       {f.icon} {f.label}
                    </button>
                ))}
            </div>
        </div>

        {filteredLoans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoans.map(loan => (
              <LoanApprovalCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No loans found for status: <span className="font-semibold">{
            filterStatus === LoanStatus.OVERDUE ? 'Overdue' : 
            filterStatus === LoanStatus.PENDING_ADMIN_REVIEW ? 'Pending Admin Review' : 
            filterStatus.replace(/_/g, ' ')
            }</span>.</p>
        )}
      </div>

      {/* Simplified CBN Compliance Report View */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold text-green-800 mb-4">CBN Compliance Data Overview (Simulated)</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Approved Amount</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                         <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Repayment Due</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loans.filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.ACTIVE || l.status === LoanStatus.REPAID || l.status === LoanStatus.OVERDUE).slice(0,10).map(loan => {
                        const officer = loan.officerId ? getUserById(loan.officerId) : null;
                        return (
                        <tr key={loan.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">{loan.farmerName}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{loan.cropType}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(loan.approvedAmount)}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                                    loan.status === LoanStatus.REPAID ? 'bg-teal-100 text-teal-800' :
                                    loan.status === LoanStatus.OVERDUE ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {loan.status.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{officer ? officer.profile.fullName : loan.officerName || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(loan.repaymentDueDate)}</td>
                        </tr>
                    )})}
                     {loans.filter(l => l.status === LoanStatus.APPROVED || l.status === LoanStatus.ACTIVE || l.status === LoanStatus.REPAID || l.status === LoanStatus.OVERDUE).length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-4 text-gray-500">No relevant loan data for report.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </PageContainer>
  );
};

export default BankOfficerDashboardPage;
