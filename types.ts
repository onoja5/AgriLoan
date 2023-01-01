export enum UserRole {
  FARMER = 'FARMER',
  BANK_OFFICER = 'BANK_OFFICER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN', // Added Admin role
}

export interface UserProfile {
  fullName: string;
  farmName?: string; // for farmer
  bankName?: string; // for bank officer
  companyName?: string; // for buyer
  // No specific admin profile fields for now
}

export interface User {
  id: string;
  emailOrPhone: string; // Using this as username
  password?: string; // In a real app, this would be hashed and not stored on client
  role: UserRole;
  profile: UserProfile;
  verificationDocs?: string[]; // Store names/references to uploaded docs
  entityName?: string; // Changed from getter to optional property
}

// Augment User instances with a getter after they are created/retrieved.
// This is a common pattern but usually done in a class or factory function.
// For this simple setup, we'll assume it's handled where User objects are instantiated
// or we'll access profile directly. For now, we'll just define it for completeness.

export enum LoanStatus {
  PENDING_ADMIN_REVIEW = 'PENDING_ADMIN_REVIEW', // New: Farmer submits, Admin to review
  PENDING_BANK_APPROVAL = 'PENDING_BANK_APPROVAL', // New: Admin approved, Bank Officer to review
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE', // After approval and disbursement
  REPAID = 'REPAID',
  OVERDUE = 'OVERDUE',
  // PENDING = 'PENDING', // Replaced by PENDING_ADMIN_REVIEW & PENDING_BANK_APPROVAL
}

export enum CropType {
  MAIZE = 'Maize',
  RICE = 'Rice',
  CASSAVA = 'Cassava',
  YAM = 'Yam',
  TOMATOES = 'Tomatoes',
  PEPPER = 'Pepper',
  GROUNDNUT = 'Groundnut',
  SORGHUM = 'Sorghum',
  COWPEA = 'Cowpea',
  OTHER = 'Other',
}

export interface LoanApplication {
  id: string;
  farmerId: string;
  farmerName: string; // Denormalized for easy display
  farmSizeAcres: number;
  cropType: CropType;
  otherCropType?: string;
  inputNeeds: string;
  requestedAmount: number;
  applicationDate: string; // ISO string
  status: LoanStatus;
  
  // Admin Review Fields
  adminReviewerId?: string;
  adminReviewerName?: string;
  adminReviewDate?: string;
  adminComments?: string;
  preApprovedAmount?: number; // Amount preliminarily approved by admin

  // Bank Officer Fields
  approvedAmount?: number;
  officerId?: string;
  officerName?: string; // Denormalized for display
  officerComments?: string;
  repaymentDueDate?: string; // ISO string
  
  repayments: Repayment[];
  expectedHarvestDate?: string; // ISO string
}

export interface Repayment {
  id: string;
  date: string; // ISO string
  amount: number;
}

export enum FieldLogActivity {
  PLANTING = 'Planting',
  WEEDING = 'Weeding',
  FERTILIZING = 'Fertilizing',
  PEST_CONTROL = 'Pest Control',
  WATERING = 'Watering',
  OBSERVATION = 'Observation',
  HARVEST_PREPARATION = 'Harvest Preparation',
  HARVESTING = 'Harvesting',
}

export interface FieldLog {
  id: string;
  farmerId: string;
  loanId?: string; 
  cropPlotId: string; // e.g., "Maize Plot 1"
  date: string; // ISO string
  activity: FieldLogActivity;
  notes: string;
  photoFileName?: string; // Name of the uploaded photo
  estimatedYieldKg?: number;
  isSynced?: boolean; // For offline simulation
}

export enum QualityGrade {
  A = 'Grade A (Premium)',
  B = 'Grade B (Good)',
  C = 'Grade C (Fair)',
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string; // Denormalized
  cropType: CropType;
  otherCropType?: string;
  quantityKg: number;
  qualityGrade: QualityGrade;
  pricePerKg: number;
  listingDate: string; // ISO string
  status: 'AVAILABLE' | 'NEGOTIATING' | 'SOLD' | 'CANCELLED';
  description?: string;
  photoFileName?: string;
}

export enum NegotiationStatus {
  PENDING_BUYER = 'PENDING_BUYER', // Buyer made offer, farmer to respond
  PENDING_FARMER = 'PENDING_FARMER', // Farmer made counter-offer, buyer to respond
  AGREED = 'AGREED',
  CANCELLED_BY_FARMER = 'CANCELLED_BY_FARMER',
  CANCELLED_BY_BUYER = 'CANCELLED_BY_BUYER',
  ORDER_PLACED = 'ORDER_PLACED' // After agreement
}

export interface ChatMessage {
  id: string;
  senderId: string; // farmerId or buyerId
  senderRole: UserRole;
  text: string;
  timestamp: string; // ISO string
  isSystem?: boolean; // For system messages like "Offer made"
}

export interface Negotiation {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string; // Denormalized
  farmerId: string;
  farmerName: string; // Denormalized
  cropType: CropType; // Denormalized from listing
  status: NegotiationStatus;
  messages: ChatMessage[];
  currentOfferPricePerKg?: number;
  currentOfferQuantityKg?: number;
  lastUpdate: string; // ISO string
}