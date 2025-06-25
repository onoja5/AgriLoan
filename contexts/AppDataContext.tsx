import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, LoanApplication, FieldLog, ProduceListing, Negotiation, UserRole, LoanStatus, CropType, QualityGrade, FieldLogActivity, NegotiationStatus, ChatMessage, Repayment } from '../types';

// Helper for local storage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue];
};


interface AppDataContextType {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  getUserById: (userId: string) => User | undefined;
  loans: LoanApplication[];
  addLoan: (loan: LoanApplication) => void;
  updateLoan: (loan: LoanApplication) => void;
  getLoansByFarmer: (farmerId: string) => LoanApplication[];
  getLoanById: (loanId: string) => LoanApplication | undefined;
  addRepayment: (loanId: string, amount: number, date: string) => boolean;
  fieldLogs: FieldLog[];
  addFieldLog: (log: FieldLog) => void;
  getFieldLogsByFarmer: (farmerId: string) => FieldLog[];
  produceListings: ProduceListing[];
  addProduceListing: (listing: ProduceListing) => void;
  updateProduceListing: (listing: ProduceListing) => void;
  getProduceListingsByFarmer: (farmerId: string) => ProduceListing[];
  getAllAvailableProduceListings: () => ProduceListing[];
  getProduceListingById: (listingId: string) => ProduceListing | undefined;
  negotiations: Negotiation[];
  addNegotiation: (negotiation: Negotiation) => void;
  updateNegotiation: (negotiation: Negotiation) => void;
  getNegotiationsByFarmer: (farmerId: string) => Negotiation[];
  getNegotiationsByBuyer: (buyerId: string) => Negotiation[];
  getNegotiationById: (negotiationId: string) => Negotiation | undefined;
  addChatMessage: (negotiationId: string, message: ChatMessage) => void;
  generateId: () => string;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: 'admin001', emailOrPhone: 'admin@test.com', password: 'password', role: UserRole.ADMIN, profile: { fullName: 'AgriLoan Admin'}, entityName: 'AgriLoan Admin Platform'},
    { id: 'bank001', emailOrPhone: 'bank@test.com', password: 'password', role: UserRole.BANK_OFFICER, profile: { fullName: 'Mr. Bank Manager', bankName: 'AgriBank Central'}, entityName: 'AgriBank Central'},
    { id: 'farmer001', emailOrPhone: 'farmer@test.com', password: 'password', role: UserRole.FARMER, profile: { fullName: 'Aisha Ibrahim', farmName: 'Aisha\'s Fields'}, entityName: 'Aisha\'s Fields'},
    { id: 'buyer001', emailOrPhone: 'buyer@test.com', password: 'password', role: UserRole.BUYER, profile: { fullName: 'John Doe Foods', companyName: 'JD Agro Processing'}, entityName: 'JD Agro Processing'},
];


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('app_users', initialUsers);
  const [loans, setLoans] = useLocalStorage<LoanApplication[]>('app_loans', []);
  const [fieldLogs, setFieldLogs] = useLocalStorage<FieldLog[]>('app_fieldLogs', []);
  const [produceListings, setProduceListings] = useLocalStorage<ProduceListing[]>('app_produceListings', []);
  const [negotiations, setNegotiations] = useLocalStorage<Negotiation[]>('app_negotiations', []);

  const generateId = (): string => Math.random().toString(36).substr(2, 9);

  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  const getUserById = useCallback((userId: string) => users.find(u => u.id === userId), [users]);


  const addLoan = (loan: LoanApplication) => setLoans(prev => [...prev, loan]);
  
  const updateLoan = (updatedLoan: LoanApplication) => {
    setLoans(prevLoans => {
        return prevLoans.map(l => {
            if (l.id === updatedLoan.id) {
                let tempLoan = { ...updatedLoan };
                // If officerId is present and officerName is not, try to populate it
                if (tempLoan.officerId && !tempLoan.officerName) {
                    const officer = users.find(u => u.id === tempLoan.officerId && u.role === UserRole.BANK_OFFICER);
                    if (officer) {
                        tempLoan.officerName = officer.profile.fullName;
                    }
                }
                // If adminReviewerId is present and adminReviewerName is not, try to populate it
                if (tempLoan.adminReviewerId && !tempLoan.adminReviewerName) {
                    const adminUser = users.find(u => u.id === tempLoan.adminReviewerId && u.role === UserRole.ADMIN);
                    if (adminUser) {
                        tempLoan.adminReviewerName = adminUser.profile.fullName;
                    }
                }
                return tempLoan;
            }
            return l;
        });
    });
  };

  const getLoansByFarmer = useCallback((farmerId: string) => loans.filter(l => l.farmerId === farmerId), [loans]);
  const getLoanById = useCallback((loanId: string) => loans.find(l => l.id === loanId), [loans]);
  
  const addRepayment = (loanId: string, amount: number, date: string): boolean => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return false;

    const newRepayment: Repayment = {
      id: generateId(),
      date,
      amount,
    };

    const updatedLoan = {
      ...loan,
      repayments: [...loan.repayments, newRepayment],
    };
    
    const totalRepaid = updatedLoan.repayments.reduce((sum, r) => sum + r.amount, 0);
    if (loan.approvedAmount && totalRepaid >= loan.approvedAmount) {
        updatedLoan.status = LoanStatus.REPAID;
    } else if (loan.repaymentDueDate && new Date(date) > new Date(loan.repaymentDueDate) && (loan.approvedAmount && totalRepaid < loan.approvedAmount)) {
        updatedLoan.status = LoanStatus.OVERDUE;
    }


    updateLoan(updatedLoan);
    return true;
  };

  const addFieldLog = (log: FieldLog) => setFieldLogs(prev => [...prev, { ...log, isSynced: true }]); // Simulate sync
  const getFieldLogsByFarmer = useCallback((farmerId: string) => fieldLogs.filter(l => l.farmerId === farmerId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [fieldLogs]);

  const addProduceListing = (listing: ProduceListing) => setProduceListings(prev => [...prev, listing]);
  const updateProduceListing = (updatedListing: ProduceListing) => setProduceListings(prev => prev.map(p => p.id === updatedListing.id ? updatedListing : p));
  const getProduceListingsByFarmer = useCallback((farmerId: string) => produceListings.filter(p => p.farmerId === farmerId), [produceListings]);
  const getAllAvailableProduceListings = useCallback(() => produceListings.filter(p => p.status === 'AVAILABLE').sort((a,b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()), [produceListings]);
  const getProduceListingById = useCallback((listingId: string) => produceListings.find(p => p.id === listingId), [produceListings]);
  
  const addNegotiation = (negotiation: Negotiation) => setNegotiations(prev => [...prev, negotiation]);
  const updateNegotiation = (updatedNegotiation: Negotiation) => setNegotiations(prev => prev.map(n => n.id === updatedNegotiation.id ? updatedNegotiation : n));
  const getNegotiationsByFarmer = useCallback((farmerId: string) => negotiations.filter(n => n.farmerId === farmerId), [negotiations]);
  const getNegotiationsByBuyer = useCallback((buyerId: string) => negotiations.filter(n => n.buyerId === buyerId), [negotiations]);
  const getNegotiationById = useCallback((negotiationId: string) => negotiations.find(n => n.id === negotiationId), [negotiations]);
  
  const addChatMessage = (negotiationId: string, message: ChatMessage) => {
    setNegotiations(prev => prev.map(n => {
      if (n.id === negotiationId) {
        // Ensure messages array exists
        const currentMessages = n.messages || [];
        return { ...n, messages: [...currentMessages, message], lastUpdate: new Date().toISOString() };
      }
      return n;
    }));
  };

  // Populate some initial data for demonstration if storages are empty
    useEffect(() => {
        const farmer = users.find(u => u.role === UserRole.FARMER && u.id === 'farmer001');
        const bankOfficer = users.find(u => u.id === 'bank001');
        // const adminUser = users.find(u => u.id === 'admin001'); // Not used yet for initial loan data creation

        if (loans.length === 0 && farmer && bankOfficer) {
            const loan1Id = generateId();
            addLoan({
                id: loan1Id,
                farmerId: farmer.id,
                farmerName: farmer.profile.fullName,
                farmSizeAcres: 10,
                cropType: CropType.MAIZE,
                inputNeeds: "Seeds, Fertilizer",
                requestedAmount: 150000,
                applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                status: LoanStatus.PENDING_ADMIN_REVIEW, // Changed to new initial status
                repayments: [],
                expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            });
            const loan2Id = generateId();
            addLoan({
                id: loan2Id,
                farmerId: farmer.id,
                farmerName: farmer.profile.fullName,
                farmSizeAcres: 5,
                cropType: CropType.CASSAVA,
                inputNeeds: "Stems, Herbicide",
                requestedAmount: 75000,
                applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                status: LoanStatus.APPROVED, // This loan is already approved by bank
                // For this approved loan, it implies admin already reviewed.
                // We can add dummy admin review data if needed for display.
                // adminReviewerId: adminUser?.id, 
                // adminReviewerName: adminUser?.profile.fullName,
                // adminComments: "Looks good, forwarded for bank processing.",
                // preApprovedAmount: 75000,
                // adminReviewDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                approvedAmount: 70000,
                officerId: bankOfficer.id,
                officerName: bankOfficer.profile.fullName,
                officerComments: 'Approved with slight reduction.',
                repaymentDueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
                repayments: [
                    { id: generateId(), date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), amount: 20000 } // repayment in the past
                ],
                expectedHarvestDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000).toISOString(),
            });
             const loan3Id = generateId();
            addLoan({
                id: loan3Id,
                farmerId: farmer.id,
                farmerName: farmer.profile.fullName,
                farmSizeAcres: 12,
                cropType: CropType.RICE,
                inputNeeds: "Seedlings, Irrigation Pump",
                requestedAmount: 250000,
                applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
                status: LoanStatus.PENDING_BANK_APPROVAL, // Admin approved, bank to review
                adminReviewerId: 'admin001', 
                adminReviewerName: 'AgriLoan Admin',
                adminComments: "Farmer has good history. Pre-approved.",
                preApprovedAmount: 250000,
                adminReviewDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                repayments: [],
                expectedHarvestDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
        if (produceListings.length === 0 && farmer) {
            addProduceListing({
                id: generateId(),
                farmerId: farmer.id,
                farmerName: farmer.profile.fullName,
                cropType: CropType.TOMATOES,
                quantityKg: 200,
                qualityGrade: QualityGrade.A,
                pricePerKg: 300,
                listingDate: new Date().toISOString(),
                status: 'AVAILABLE',
                description: 'Freshly harvested Roma tomatoes.'
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

  return (
    <AppDataContext.Provider value={{
      users, addUser, updateUser, getUserById,
      loans, addLoan, updateLoan, getLoansByFarmer, getLoanById, addRepayment,
      fieldLogs, addFieldLog, getFieldLogsByFarmer,
      produceListings, addProduceListing, updateProduceListing, getProduceListingsByFarmer, getAllAvailableProduceListings, getProduceListingById,
      negotiations, addNegotiation, updateNegotiation, getNegotiationsByFarmer, getNegotiationsByBuyer, getNegotiationById, addChatMessage,
      generateId
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};