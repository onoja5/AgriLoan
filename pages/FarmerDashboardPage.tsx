import React, { useState, useMemo, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoanApplicationForm from '../components/farmer/LoanApplicationForm';
import ProduceListingForm from '../components/farmer/ProduceListingForm';
import FieldLogForm from '../components/farmer/FieldLogForm';
import { LoanApplication, FieldLog, ProduceListing, LoanStatus } from '../types';
import { formatDate, formatCurrency, getLoanStatusColor } from '../utils/helpers';
import FieldLogItem from '../components/farmer/FieldLogItem';
import { IconPlusCircle, IconFarm, IconDocumentText, IconCalendar, IconBuyer, IconChat, NairaSymbol, IconInfo } from '../constants';
import AiAdviceModal from '../components/farmer/AiAdviceModal'; // New Modal
import { getAdviceForFieldLog } from '../services/geminiService'; // New Service
import LoanDetailsModal from '../components/farmer/LoanDetailsModal'; // For loan details and repayments

const FarmerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    getLoansByFarmer, 
    getFieldLogsByFarmer, 
    getProduceListingsByFarmer,
    getNegotiationsByFarmer,
    getNegotiationById,
    updateNegotiation,
    getLoanById, 
    getProduceListingById // Destructured here
  } = useAppData();

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
  
  const [isLoanDetailsModalOpen, setIsLoanDetailsModalOpen] = useState(false);
  const [selectedLoanForDetails, setSelectedLoanForDetails] = useState<LoanApplication | null>(null);


  // AI Advice Modal State
  const [isAiAdviceModalOpen, setIsAiAdviceModalOpen] = useState(false);
  const [selectedLogForAdvice, setSelectedLogForAdvice] = useState<FieldLog | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);
  const [aiAdviceError, setAiAdviceError] = useState<string | null>(null);


  if (!currentUser) return null;

  const loans = useMemo(() => getLoansByFarmer(currentUser.id).sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()), [getLoansByFarmer, currentUser.id]);
  const fieldLogs = useMemo(() => getFieldLogsByFarmer(currentUser.id), [getFieldLogsByFarmer, currentUser.id]);
  const produceListings = useMemo(() => getProduceListingsByFarmer(currentUser.id).sort((a,b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()), [getProduceListingsByFarmer, currentUser.id]);
  const negotiations = useMemo(() => getNegotiationsByFarmer(currentUser.id).sort((a,b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()), [getNegotiationsByFarmer, currentUser.id]);

  const activeLoans = useMemo(() => loans.filter(loan => loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.APPROVED), [loans]);

  const selectedNegotiation = selectedNegotiationId ? getNegotiationById(selectedNegotiationId) : null;
  const selectedListingForNegotiation = selectedNegotiation ? getProduceListingById(selectedNegotiation.listingId) : null;

  const handleGetAiAdvice = async (log: FieldLog) => {
    setSelectedLogForAdvice(log);
    setIsAiAdviceModalOpen(true);
    setAiAdviceLoading(true);
    setAiAdvice(null);
    setAiAdviceError(null);

    try {
      const associatedLoan = log.loanId ? getLoanById(log.loanId) : undefined;
      const advice = await getAdviceForFieldLog(log, associatedLoan);
      setAiAdvice(advice);
    } catch (error: any) {
      console.error("Error fetching AI advice:", error);
      setAiAdviceError(error.message || "Failed to fetch advice. Please check your connection or try again later.");
    } finally {
      setAiAdviceLoading(false);
    }
  };

  const openLoanDetailsModal = (loan: LoanApplication) => {
    setSelectedLoanForDetails(loan);
    setIsLoanDetailsModalOpen(true);
  };


  const renderLoanItem = (loan: LoanApplication) => {
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);
    const remainingBalance = (loan.approvedAmount || 0) - totalRepaid;
    
    // Dynamically determine if overdue for display, if not already REPAID or explicitly OVERDUE
    let displayStatus: LoanStatus = loan.status;
    let displayStatusColor = getLoanStatusColor(loan.status);

    if (loan.status !== LoanStatus.REPAID && loan.status !== LoanStatus.REJECTED && loan.repaymentDueDate && new Date() > new Date(loan.repaymentDueDate) && remainingBalance > 0) {
        if(loan.status !== LoanStatus.OVERDUE) { 
          displayStatus = LoanStatus.OVERDUE; 
          displayStatusColor = getLoanStatusColor(LoanStatus.OVERDUE);
        }
    }


    return (
        <div key={loan.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-md font-semibold text-green-700">{loan.cropType} Loan</h3>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${displayStatusColor}`}>
            {displayStatus}
            </span>
        </div>
        <p className="text-sm text-gray-600">Req. Amount: {formatCurrency(loan.requestedAmount)}</p>
        {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.REPAID || loan.status === LoanStatus.OVERDUE ) && loan.approvedAmount && (
            <p className="text-sm text-green-600 font-semibold">Approved: {formatCurrency(loan.approvedAmount)}</p>
        )}
        <p className="text-xs text-gray-500">Applied: {formatDate(loan.applicationDate)}</p>
        {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.REPAID || loan.status === LoanStatus.OVERDUE) && loan.repaymentDueDate && (
            <p className="text-xs text-red-500">Repay by: {formatDate(loan.repaymentDueDate)}</p>
        )}
        {(loan.status === LoanStatus.APPROVED || loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.OVERDUE) && remainingBalance > 0 && (
            <p className="text-xs text-orange-600 mt-1">Remaining: {formatCurrency(remainingBalance)}</p>
        )}
        {loan.status === LoanStatus.REPAID && (
            <p className="text-xs text-purple-600 mt-1 font-semibold">Fully Repaid</p>
        )}
        
        {/* Simple repayment reminder simulation */}
        {loan.status !== LoanStatus.REPAID && loan.repaymentDueDate && new Date(loan.repaymentDueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && new Date(loan.repaymentDueDate) > new Date() && remainingBalance > 0 && (
            <p className="text-xs text-orange-500 mt-1 p-1 bg-orange-100 rounded">Reminder: Repayment due soon!</p>
        )}
        <Button 
            variant="secondary" 
            size="sm" 
            className="mt-2 w-full text-xs"
            onClick={() => openLoanDetailsModal(loan)}
            leftIcon={<IconInfo className="w-3 h-3"/>}
        >
            View Details / Repay
        </Button>
        </div>
    );
  };

  const renderProduceListingItem = (listing: ProduceListing) => (
    <div key={listing.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 className="text-md font-semibold text-green-700">{listing.cropType}</h3>
      <p className="text-sm text-gray-600">Qty: {listing.quantityKg}kg | Price: {formatCurrency(listing.pricePerKg)}/kg</p>
      <p className="text-xs text-gray-500">Grade: {listing.qualityGrade} | Listed: {formatDate(listing.listingDate)}</p>
      <p className={`text-xs font-semibold mt-1 ${listing.status === 'AVAILABLE' ? 'text-green-600' : 'text-yellow-600'}`}>Status: {listing.status}</p>
    </div>
  );
  
  const openNegotiationModal = (negotiationId: string) => {
    setSelectedNegotiationId(negotiationId);
    setIsNegotiationModalOpen(true);
  };

  const NegotiationChat = React.lazy(() => import('../components/buyer/NegotiationChat'));


  return (
    <PageContainer title="Farmer Dashboard" titleIcon={<IconFarm className="w-8 h-8"/>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Loans Section */}
        <section className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-green-800 flex items-center"><IconDocumentText className="w-6 h-6 mr-2 text-green-600"/>My Loans</h2>
            <Button size="sm" variant="primary" onClick={() => setIsLoanModalOpen(true)} leftIcon={<IconPlusCircle className="w-4 h-4"/>}>New Loan</Button>
          </div>
          {loans.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">{loans.map(renderLoanItem)}</div>
          ) : (
             <div className="text-center py-6">
                <IconDocumentText className="w-16 h-16 text-gray-300 mx-auto mb-2"/>
                <p className="text-sm text-gray-500 mb-2">No loan applications yet.</p>
                <Button size="sm" variant="primary" onClick={() => setIsLoanModalOpen(true)} leftIcon={<IconPlusCircle className="w-4 h-4"/>}>Apply for a Loan</Button>
            </div>
          )}
        </section>

        {/* Field Logs Section */}
        <section className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-green-800 flex items-center"><IconCalendar className="w-6 h-6 mr-2 text-green-600"/>Field Logs</h2>
            <Button size="sm" variant="primary" onClick={() => setIsLogModalOpen(true)} leftIcon={<IconPlusCircle className="w-4 h-4"/>}>New Log</Button>
          </div>
          {fieldLogs.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {fieldLogs.map(log => <FieldLogItem key={log.id} log={log} onGetAiAdvice={handleGetAiAdvice} />)}
            </div>
          ) : (
            <div className="text-center py-6">
                <IconCalendar className="w-16 h-16 text-gray-300 mx-auto mb-2"/>
                <p className="text-sm text-gray-500 mb-2">No field logs recorded yet.</p>
                <Button size="sm" variant="primary" onClick={() => setIsLogModalOpen(true)} leftIcon={<IconPlusCircle className="w-4 h-4"/>}>Add First Log</Button>
            </div>
          )}
        </section>

        {/* Produce Listings Section */}
        <section className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-green-800 flex items-center">
                <span className="text-2xl mr-1 text-green-600">{NairaSymbol}</span>My Produce
            </h2>
            <Button size="sm" variant="primary" onClick={() => setIsListingModalOpen(true)} leftIcon={<IconPlusCircle className="w-4 h-4"/>}>New Listing</Button>
          </div>
          {produceListings.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">{produceListings.map(renderProduceListingItem)}</div>
          ) : (
            <div className="text-center py-6">
                <span className="text-4xl text-gray-300 mx-auto mb-2 block">{NairaSymbol}</span>
                <p className="text-sm text-gray-500 mb-2">No produce listed for sale yet.</p>
                <Button size="sm" variant="primary" onClick={() => setIsListingModalOpen(true)} leftIcon={<IconPlusCircle className="w-4 h-4"/>}>List Your Produce</Button>
            </div>
          )}
        </section>
      </div>

      {/* Negotiations Section */}
      <section className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center"><IconChat className="w-6 h-6 mr-2 text-green-600"/>My Negotiations</h2>
        {negotiations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {negotiations.map(neg => (
              <div key={neg.id} className="bg-gray-50 p-3 rounded-md border hover:shadow-md transition-shadow cursor-pointer" onClick={() => openNegotiationModal(neg.id)}>
                <p className="font-semibold text-green-700">Re: {neg.cropType} with {neg.buyerName}</p>
                <p className="text-xs text-gray-500">Last update: {formatDate(neg.lastUpdate)}</p>
                <p className={`text-xs font-medium mt-1 ${neg.status.startsWith('PENDING') ? 'text-yellow-600' : neg.status === 'AGREED' ? 'text-blue-600' : neg.status === 'ORDER_PLACED' ? 'text-green-600' : 'text-red-600'}`}>Status: {neg.status.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No active negotiations. Buyers can initiate negotiations on your listed produce.</p>
        )}
      </section>

      {/* Modals */}
      <Modal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} title="New Loan Application">
        <LoanApplicationForm onClose={() => setIsLoanModalOpen(false)} />
      </Modal>
      <Modal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} title="List New Produce">
        <ProduceListingForm onClose={() => setIsListingModalOpen(false)} />
      </Modal>
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="New Field Log">
        <FieldLogForm onClose={() => setIsLogModalOpen(false)} activeLoans={activeLoans} />
      </Modal>
      
      {selectedNegotiation && selectedListingForNegotiation && (
        <Modal isOpen={isNegotiationModalOpen} onClose={() => { setIsNegotiationModalOpen(false); setSelectedNegotiationId(null);}} title="Negotiation Chat" size="xl">
            <Suspense fallback={<div className="p-4 text-center">Loading chat...</div>}>
                <NegotiationChat 
                    negotiation={selectedNegotiation} 
                    listing={selectedListingForNegotiation}
                    onClose={() => { setIsNegotiationModalOpen(false); setSelectedNegotiationId(null);}}
                    onUpdateNegotiation={updateNegotiation}
                />
            </Suspense>
        </Modal>
      )}

      {selectedLogForAdvice && (
        <AiAdviceModal
            isOpen={isAiAdviceModalOpen}
            onClose={() => {
                setIsAiAdviceModalOpen(false);
                setSelectedLogForAdvice(null); // Clear selected log
            }}
            log={selectedLogForAdvice}
            advice={aiAdvice}
            isLoading={aiAdviceLoading}
            error={aiAdviceError}
        />
      )}
      
      <LoanDetailsModal 
        isOpen={isLoanDetailsModalOpen}
        onClose={() => {
            setIsLoanDetailsModalOpen(false);
            setSelectedLoanForDetails(null);
        }}
        loan={selectedLoanForDetails}
      />


    </PageContainer>
  );
};

export default FarmerDashboardPage;