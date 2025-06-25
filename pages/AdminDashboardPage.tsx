import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import PageContainer from '../components/layout/PageContainer';
import { IconAdmin, IconDocumentText, IconUserCircle, IconClock } from '../constants';
import { User, LoanApplication, UserRole, LoanStatus } from '../types';
import { formatDate, formatCurrency, getLoanStatusColor } from '../utils/helpers';
import AdminLoanReviewCard from '../components/admin/AdminLoanReviewCard'; // New import

const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, loans } = useAppData();

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return <PageContainer title="Access Denied">You do not have permission to view this page.</PageContainer>;
  }

  const sortedUsers = [...users].sort((a, b) => a.profile.fullName.localeCompare(b.profile.fullName));
  const sortedLoans = [...loans].sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());

  const loansPendingAdminReview = useMemo(() => {
    return sortedLoans.filter(loan => loan.status === LoanStatus.PENDING_ADMIN_REVIEW);
  }, [sortedLoans]);

  return (
    <PageContainer title="Administrator Dashboard" titleIcon={<IconAdmin className="w-8 h-8" />}>
      <p className="mb-6 text-lg text-gray-700">
        Welcome, <span className="font-semibold">{currentUser.profile.fullName}</span>. Manage loan applications and platform users.
      </p>

      {/* Loan Applications Pending Admin Review Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <IconClock className="w-6 h-6 mr-2 text-purple-600" /> Loan Applications for Your Review ({loansPendingAdminReview.length})
        </h2>
        {loansPendingAdminReview.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loansPendingAdminReview.map((loan: LoanApplication) => (
              <AdminLoanReviewCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            <p>No loan applications are currently pending your review.</p>
          </div>
        )}
      </section>

      {/* Users Overview Section */}
      <section className="mb-8 bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <IconUserCircle className="w-6 h-6 mr-2 text-green-600" /> All Registered Users ({sortedUsers.length})
        </h2>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Email/Phone</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Entity Name</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{user.profile.fullName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{user.emailOrPhone}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === UserRole.FARMER ? 'bg-green-100 text-green-800' :
                        user.role === UserRole.BUYER ? 'bg-blue-100 text-blue-800' :
                        user.role === UserRole.BANK_OFFICER ? 'bg-yellow-100 text-yellow-800' :
                        user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                     }`}>
                        {user.role}
                     </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {user.role === UserRole.FARMER ? user.profile.farmName :
                     user.role === UserRole.BUYER ? user.profile.companyName :
                     user.role === UserRole.BANK_OFFICER ? user.profile.bankName : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedUsers.length === 0 && <p className="text-center py-4 text-gray-500">No users found.</p>}
        </div>
      </section>

      {/* All Loans Overview Section */}
      <section className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <IconDocumentText className="w-6 h-6 mr-2 text-green-600" /> All Loan Applications ({sortedLoans.length})
        </h2>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Farmer Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Crop Type</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Requested Amt.</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Admin Pre-Appr. Amt.</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Bank Appr. Amt.</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Application Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLoans.map((loan: LoanApplication) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{loan.farmerName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{loan.cropType} {loan.otherCropType ? `(${loan.otherCropType})` : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(loan.requestedAmount)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{loan.preApprovedAmount ? formatCurrency(loan.preApprovedAmount) : 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{loan.approvedAmount ? formatCurrency(loan.approvedAmount) : 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLoanStatusColor(loan.status)}`}>
                      {loan.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDate(loan.applicationDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedLoans.length === 0 && <p className="text-center py-4 text-gray-500">No loan applications found.</p>}
        </div>
      </section>
    </PageContainer>
  );
};

export default AdminDashboardPage;