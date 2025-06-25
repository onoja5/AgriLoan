
import React from 'react';
import { ProduceListing } from '../../types';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../common/Button';
import { IconChat, IconCalendar } from '../../constants';

interface MarketplaceItemCardProps {
  listing: ProduceListing;
  onStartNegotiation: (listing: ProduceListing) => void;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({ listing, onStartNegotiation }) => {
  const placeholderImage = `https://picsum.photos/seed/${listing.id}/300/200`; // Consistent image per listing

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {listing.photoFileName ? (
        // In a real app, this would be an actual image URL
        <img src={placeholderImage} alt={listing.cropType} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-green-100 flex items-center justify-center text-green-500">
          <IconCalendar className="w-12 h-12" /> {/* Placeholder icon */}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-green-700">{listing.cropType} {listing.otherCropType ? `(${listing.otherCropType})` : ''}</h3>
        <p className="text-sm text-gray-500 mb-1">From: {listing.farmerName}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm my-2">
            <div>
                <p className="text-gray-500">Quantity</p>
                <p className="font-medium text-gray-800">{listing.quantityKg} kg</p>
            </div>
            <div>
                <p className="text-gray-500">Grade</p>
                <p className="font-medium text-gray-800">{listing.qualityGrade}</p>
            </div>
            <div>
                <p className="text-gray-500">Price/kg</p>
                <p className="font-medium text-green-600">{formatCurrency(listing.pricePerKg)}</p>
            </div>
            <div>
                <p className="text-gray-500">Listed</p>
                <p className="font-medium text-gray-800">{formatDate(listing.listingDate)}</p>
            </div>
        </div>

        {listing.description && (
          <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded my-2">{listing.description}</p>
        )}

        {listing.status === 'AVAILABLE' && (
          <Button 
            variant="primary" 
            size="sm" 
            className="w-full mt-2" 
            onClick={() => onStartNegotiation(listing)}
            leftIcon={<IconChat className="w-4 h-4"/>}
          >
            Start Negotiation
          </Button>
        )}
        {listing.status !== 'AVAILABLE' && (
            <p className={`text-center text-sm font-semibold p-2 rounded ${listing.status === 'SOLD' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                Status: {listing.status}
            </p>
        )}
      </div>
    </div>
  );
};

export default MarketplaceItemCard;
