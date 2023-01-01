import { LoanStatus } from "../types"; // Import LoanStatus if not already

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
   try {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatCurrency = (amount?: number, currency: string = 'NGN'): string => {
  if (amount === undefined || amount === null) return 'N/A';
  const symbol = currency === 'NGN' ? '₦' : currency;
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const getLoanStatusColor = (status: string): string => { // status can be LoanStatus or other strings
  switch (status as LoanStatus) { // Cast to LoanStatus for switch, string for general use
    case LoanStatus.PENDING_ADMIN_REVIEW: return 'text-purple-600 bg-purple-100'; // New status
    case LoanStatus.PENDING_BANK_APPROVAL: return 'text-indigo-600 bg-indigo-100'; // New status
    // case LoanStatus.PENDING: return 'text-yellow-600 bg-yellow-100'; // Old PENDING
    case LoanStatus.APPROVED: return 'text-blue-600 bg-blue-100';
    case LoanStatus.ACTIVE: return 'text-green-600 bg-green-100';
    case LoanStatus.REJECTED: return 'text-red-600 bg-red-100';
    case LoanStatus.REPAID: return 'text-teal-600 bg-teal-100'; // Changed color for REPAID for better distinction
    case LoanStatus.OVERDUE: return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  }
  return parts[0][0].toUpperCase();
};