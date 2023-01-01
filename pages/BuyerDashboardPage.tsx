
import React, { useState, useMemo, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import PageContainer from '../components/layout/PageContainer';
import MarketplaceItemCard from '../components/buyer/MarketplaceItemCard';
import Modal from '../components/common/Modal';
import { ProduceListing, Negotiation, NegotiationStatus, UserRole, CropType } from '../types';
import { IconBuyer, IconChat, IconPlusCircle, NairaSymbol, IconDocumentText } from '../constants';
import Button from '../common/Button';
import Select from '../components/common/Select';
import { CROP_TYPES_ARRAY } from '../constants';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';

// Lazy load NegotiationChat
const NegotiationChat = React.lazy(() => import('../components/buyer/NegotiationChat'));

const BuyerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    getAllAvailableProduceListings, 
    addNegotiation, 
    generateId, 
    getNegotiationsByBuyer,
    getProduceListingById,
    updateNegotiation,
    getNegotiationById
  } = useAppData();

  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);
  const [activeNegotiation, setActiveNegotiation] = useState<Negotiation | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCropType, setFilterCropType] = useState<CropType | 'ALL'>('ALL');


  if (!currentUser) return null;

  const availableListings = useMemo(() => {
    return getAllAvailableProduceListings().filter(listing => {
        const matchesSearchTerm = listing.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (listing.otherCropType && listing.otherCropType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                  listing.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (listing.description && listing.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCropType = filterCropType === 'ALL' || listing.cropType === filterCropType;
        return matchesSearchTerm && matchesCropType;
    });
  }, [getAllAvailableProduceListings, searchTerm, filterCropType]);
  
  const buyerNegotiations = useMemo(() => {
    return getNegotiationsByBuyer(currentUser.id).sort((a,b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [getNegotiationsByBuyer, currentUser.id]);

  const activeBuyerNegotiations = useMemo(() => {
    return buyerNegotiations.filter(neg => neg.status !== NegotiationStatus.ORDER_PLACED && !neg.status.startsWith('CANCELLED'));
  }, [buyerNegotiations]);

  const orderHistory = useMemo(() => {
    return buyerNegotiations.filter(neg => neg.status === NegotiationStatus.ORDER_PLACED);
  }, [buyerNegotiations]);


  const handleStartNegotiation = (listing: ProduceListing) => {
    const existingNegotiation = buyerNegotiations.find(neg => neg.listingId === listing.id && neg.buyerId === currentUser.id);
    if (existingNegotiation) {
        setActiveNegotiation(existingNegotiation);
    } else {
        const newNegotiation: Negotiation = {
            id: generateId(),
            listingId: listing.id,
            buyerId: currentUser.id,
            buyerName: currentUser.profile.fullName,
            farmerId: listing.farmerId,
            farmerName: listing.farmerName,
            cropType: listing.cropType,
            status: NegotiationStatus.PENDING_BUYER, // Buyer initiates
            messages: [{
                id: generateId(),
                senderId: 'system',
                senderRole: UserRole.BANK_OFFICER, // System role
                text: `${currentUser.profile.fullName} started a negotiation for ${listing.cropType}.`,
                timestamp: new Date().toISOString(),
                isSystem: true,
            }],
            currentOfferPricePerKg: listing.pricePerKg, // Initial offer is listing price
            currentOfferQuantityKg: listing.quantityKg, // Initial offer is full quantity
            lastUpdate: new Date().toISOString(),
        };
        addNegotiation(newNegotiation);
        setActiveNegotiation(newNegotiation);
    }
    setSelectedListing(listing);
    setIsNegotiationModalOpen(true);
  };
  
  const openExistingNegotiation = (negotiationId: string) => {
    const negotiation = getNegotiationById(negotiationId);
    if (negotiation) {
        const listing = getProduceListingById(negotiation.listingId);
        if (listing) {
            setSelectedListing(listing);
            setActiveNegotiation(negotiation);
            setIsNegotiationModalOpen(true);
        } else {
            alert("Could not find the associated listing for this negotiation.");
        }
    }
  };
  
  const cropTypeOptions = [{value: 'ALL', label: 'All Crop Types'}, ...CROP_TYPES_ARRAY.map(ct => ({ value: ct, label: ct }))];


  return (
    <PageContainer title="Buyer Marketplace & Orders" titleIcon={<IconBuyer className="w-8 h-8"/>}>
      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow sticky top-[68px] z-30"> {/* Adjust top based on header height */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <input
            type="text"
            placeholder="Search by crop, farmer, description..."
            className="form-input w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Filter by Crop Type"
            options={cropTypeOptions}
            value={filterCropType}
            onChange={(e) => setFilterCropType(e.target.value as CropType | 'ALL')}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Active Negotiations */}
      <section className="mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                <IconChat className="w-6 h-6 mr-2 text-green-600"/> My Active Negotiations ({activeBuyerNegotiations.length})
            </h2>
            {activeBuyerNegotiations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeBuyerNegotiations.map(neg => (
                    <div key={neg.id} className="bg-yellow-50 p-3 rounded-md border border-yellow-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openExistingNegotiation(neg.id)}>
                        <p className="font-semibold text-yellow-800">Re: {neg.cropType} with {neg.farmerName}</p>
                        <p className="text-xs text-gray-500">Last update: {formatDateTime(neg.lastUpdate)}</p>
                        <p className={`text-xs font-medium mt-1 ${neg.status.startsWith('PENDING') ? 'text-orange-600' : neg.status === 'AGREED' ? 'text-blue-600' : 'text-gray-600'}`}>Status: {neg.status.replace(/_/g, ' ')}</p>
                    </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">You have no active negotiations. Start one by selecting a product from the marketplace below!</p>
            )}
      </section>

      {/* Order History */}
      <section className="mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                <IconDocumentText className="w-6 h-6 mr-2 text-green-600"/> My Order History ({orderHistory.length})
            </h2>
            {orderHistory.length > 0 ? (
                <div className="space-y-3">
                    {orderHistory.map(order => {
                        const listingForHistory = getProduceListingById(order.listingId);
                        return (
                            <div key={order.id} className="bg-green-50 p-3 rounded-md border border-green-200">
                                <p className="font-semibold text-green-700">Order for: {order.cropType} from {order.farmerName}</p>
                                <p className="text-xs text-gray-600">
                                    Placed on: {formatDateTime(order.lastUpdate)} | 
                                    Quantity: {order.currentOfferQuantityKg}kg | 
                                    Price: {formatCurrency(order.currentOfferPricePerKg)}/kg
                                </p>
                                <p className="text-sm font-bold text-green-600">
                                    Total: {formatCurrency((order.currentOfferQuantityKg || 0) * (order.currentOfferPricePerKg || 0))}
                                </p>
                                {listingForHistory && <p className="text-xs text-gray-500 mt-1">Original Listing: {listingForHistory.qualityGrade}</p>}
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <p className="text-sm text-gray-500 text-center py-4">You haven't placed any orders yet. Finalize a negotiation to see it here.</p>
            )}
      </section>


      {/* Available Produce Listings */}
      <section>
        <h2 className="text-2xl font-semibold text-green-800 mb-4">Available Produce ({availableListings.length})</h2>
        {availableListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {availableListings.map(listing => (
              <MarketplaceItemCard
                key={listing.id}
                listing={listing}
                onStartNegotiation={handleStartNegotiation}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No produce listings available that match your criteria, or the marketplace is currently empty. Check back later or adjust your filters.
          </p>
        )}
      </section>

      {/* Negotiation Modal */}
      {isNegotiationModalOpen && selectedListing && activeNegotiation && (
        <Modal 
            isOpen={isNegotiationModalOpen} 
            onClose={() => {
                setIsNegotiationModalOpen(false); 
                setSelectedListing(null); 
                setActiveNegotiation(null);
            }} 
            title={`Negotiate: ${selectedListing.cropType} with ${selectedListing.farmerName}`}
            size="xl"
        >
          <Suspense fallback={<div className="p-6 text-center text-lg text-green-600">Loading Chat Interface...</div>}>
            <NegotiationChat
              negotiation={activeNegotiation}
              listing={selectedListing} 
              onClose={() => {
                setIsNegotiationModalOpen(false);
                setSelectedListing(null);
                setActiveNegotiation(null);
              }}
              onUpdateNegotiation={(updatedNeg) => {
                updateNegotiation(updatedNeg); 
                setActiveNegotiation(updatedNeg); 
              }}
            />
          </Suspense>
        </Modal>
      )}
    </PageContainer>
  );
};

export default BuyerDashboardPage;
