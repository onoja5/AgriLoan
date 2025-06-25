
import React, { useState, useEffect, useRef } from 'react';
import { Negotiation, ChatMessage, UserRole, NegotiationStatus, ProduceListing } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useAppData } from '../../contexts/AppDataContext';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatDateTime, formatCurrency, getInitials } from '../../utils/helpers';
import { IconSend, NairaSymbol } from '../../constants';

interface NegotiationChatProps {
  negotiation: Negotiation;
  listing: ProduceListing; // The original listing details
  onClose: () => void;
  onUpdateNegotiation: (updatedNegotiation: Negotiation) => void;
}

const NegotiationChat: React.FC<NegotiationChatProps> = ({ negotiation, listing, onClose, onUpdateNegotiation }) => {
  const { currentUser } = useAuth();
  const { addChatMessage, generateId } = useAppData();
  const [messageText, setMessageText] = useState('');
  const [offerPrice, setOfferPrice] = useState<number | ''>(listing.pricePerKg);
  const [offerQuantity, setOfferQuantity] = useState<number | ''>(listing.quantityKg);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [negotiation.messages]);

  if (!currentUser) return null;

  const isFarmer = currentUser.id === negotiation.farmerId;
  const isBuyer = currentUser.id === negotiation.buyerId;
  const canTakeAction = 
    (isFarmer && negotiation.status === NegotiationStatus.PENDING_FARMER) ||
    (isBuyer && negotiation.status === NegotiationStatus.PENDING_BUYER) ||
    (negotiation.status !== NegotiationStatus.AGREED && negotiation.status !== NegotiationStatus.ORDER_PLACED && negotiation.status !== NegotiationStatus.CANCELLED_BY_FARMER && negotiation.status !== NegotiationStatus.CANCELLED_BY_BUYER );


  const handleSendMessage = () => {
    if (messageText.trim() === '') return;
    const newMessage: ChatMessage = {
      id: generateId(),
      senderId: currentUser.id,
      senderRole: currentUser.role,
      text: messageText,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(negotiation.id, newMessage);
    setMessageText('');
  };

  const handleOfferAction = (action: 'make_offer' | 'accept_offer' | 'decline_offer') => {
    if (!canTakeAction) return;

    let newStatus: NegotiationStatus = negotiation.status;
    let systemMessageText = '';

    if (action === 'make_offer') {
      if (offerPrice === '' || offerQuantity === '' || Number(offerPrice) <= 0 || Number(offerQuantity) <= 0) {
        alert("Please enter valid price and quantity for the offer.");
        return;
      }
      systemMessageText = `${currentUser.profile.fullName} made an offer: ${formatCurrency(Number(offerPrice))}/kg for ${offerQuantity}kg.`;
      newStatus = isBuyer ? NegotiationStatus.PENDING_FARMER : NegotiationStatus.PENDING_BUYER;
    } else if (action === 'accept_offer') {
      if (!negotiation.currentOfferPricePerKg || !negotiation.currentOfferQuantityKg) {
        alert("No active offer to accept.");
        return;
      }
      systemMessageText = `${currentUser.profile.fullName} accepted the offer of ${formatCurrency(negotiation.currentOfferPricePerKg)}/kg for ${negotiation.currentOfferQuantityKg}kg.`;
      newStatus = NegotiationStatus.AGREED;
    } else if (action === 'decline_offer') {
      systemMessageText = `${currentUser.profile.fullName} declined the current offer.`;
      // Status remains pending for the other party or goes back to general negotiation
      newStatus = isBuyer ? NegotiationStatus.PENDING_BUYER : NegotiationStatus.PENDING_FARMER; // Reverts to self to make counter or message
    }

    const systemMessage: ChatMessage = {
      id: generateId(),
      senderId: 'system',
      senderRole: UserRole.BANK_OFFICER, // Placeholder for system role
      text: systemMessageText,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };
    addChatMessage(negotiation.id, systemMessage);
    
    const updatedNegotiation: Negotiation = {
      ...negotiation,
      status: newStatus,
      currentOfferPricePerKg: action === 'make_offer' ? Number(offerPrice) : (action === 'accept_offer' ? negotiation.currentOfferPricePerKg : undefined),
      currentOfferQuantityKg: action === 'make_offer' ? Number(offerQuantity) : (action === 'accept_offer' ? negotiation.currentOfferQuantityKg : undefined),
      lastUpdate: new Date().toISOString(),
      messages: [...negotiation.messages, systemMessage]
    };
    onUpdateNegotiation(updatedNegotiation); // This should update AppData context state
  };
  
  const handlePlaceOrder = () => {
    if (negotiation.status !== NegotiationStatus.AGREED) return;
    const systemMessageText = `Order placed by ${currentUser.profile.fullName} for ${negotiation.currentOfferQuantityKg}kg at ${formatCurrency(negotiation.currentOfferPricePerKg!)}/kg. Total: ${formatCurrency(negotiation.currentOfferQuantityKg! * negotiation.currentOfferPricePerKg!)}.`;
    const systemMessage: ChatMessage = {
      id: generateId(),
      senderId: 'system',
      senderRole: UserRole.BANK_OFFICER,
      text: systemMessageText,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };
    addChatMessage(negotiation.id, systemMessage);
    const updatedNegotiation: Negotiation = {
        ...negotiation,
        status: NegotiationStatus.ORDER_PLACED,
        lastUpdate: new Date().toISOString(),
        messages: [...negotiation.messages, systemMessage]
    };
    onUpdateNegotiation(updatedNegotiation);
  };


  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-green-700">
          Negotiating: {listing.cropType} with {isBuyer ? negotiation.farmerName : negotiation.buyerName}
        </h3>
        <p className="text-xs text-gray-500">Original Listing: {listing.quantityKg}kg at {formatCurrency(listing.pricePerKg)}/kg</p>
        <p className={`text-xs font-semibold ${
            negotiation.status === NegotiationStatus.AGREED || negotiation.status === NegotiationStatus.ORDER_PLACED ? 'text-green-600' : 
            negotiation.status.startsWith('CANCELLED') ? 'text-red-600' : 'text-yellow-600'
          }`}>Status: {negotiation.status.replace(/_/g, ' ')}
        </p>
        {negotiation.currentOfferPricePerKg && negotiation.currentOfferQuantityKg && negotiation.status !== NegotiationStatus.AGREED && negotiation.status !== NegotiationStatus.ORDER_PLACED && (
          <p className="text-xs text-blue-600 mt-1">
            Current Offer: {formatCurrency(negotiation.currentOfferPricePerKg)}/kg for {negotiation.currentOfferQuantityKg}kg.
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 space-y-3 overflow-y-auto h-64 sm:h-80 bg-gray-50">
        {negotiation.messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${
                msg.isSystem ? 'bg-yellow-100 text-yellow-800 w-full text-center text-xs' :
                msg.senderId === currentUser.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {!msg.isSystem && (
                <p className="text-xs font-semibold mb-0.5">
                    {msg.senderId === negotiation.farmerId ? negotiation.farmerName.split(' ')[0] : negotiation.buyerName.split(' ')[0]}
                </p>
              )}
              <p className="text-sm">{msg.text}</p>
              {!msg.isSystem && <p className="text-xs mt-1 opacity-75 text-right">{formatDateTime(msg.timestamp)}</p>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Actions & Input */}
      {negotiation.status !== NegotiationStatus.ORDER_PLACED && !negotiation.status.startsWith('CANCELLED') && (
        <div className="p-4 border-t border-gray-200 bg-gray-100">
            {canTakeAction && negotiation.status !== NegotiationStatus.AGREED && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Input type="number" placeholder="Offer Qty (kg)" value={offerQuantity} onChange={e => setOfferQuantity(e.target.value === '' ? '' : Number(e.target.value))} min="1" step="any" className="text-sm py-1"/>
                <Input type="number" placeholder="Offer Price/kg" value={offerPrice} onChange={e => setOfferPrice(e.target.value === '' ? '' : Number(e.target.value))} min="1" step="any" icon={NairaSymbol} className="text-sm py-1"/>
              </div>
            )}

            <div className="flex items-center space-x-2 mb-3">
                {canTakeAction && negotiation.status !== NegotiationStatus.AGREED && (
                    <Button size="sm" variant="primary" onClick={() => handleOfferAction('make_offer')}>Make/Update Offer</Button>
                )}
                {canTakeAction && (negotiation.status === NegotiationStatus.PENDING_FARMER && isFarmer || negotiation.status === NegotiationStatus.PENDING_BUYER && isBuyer) && negotiation.currentOfferPricePerKg && (
                    <>
                        <Button size="sm" variant="secondary" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleOfferAction('accept_offer')}>Accept Offer</Button>
                        <Button size="sm" variant="danger" onClick={() => handleOfferAction('decline_offer')}>Decline Offer</Button>
                    </>
                )}
            </div>

            {negotiation.status === NegotiationStatus.AGREED && isBuyer && (
                <Button variant="primary" className="w-full mb-3" onClick={handlePlaceOrder}>Place Order based on Agreement</Button>
            )}

            <div className="flex items-center space-x-2">
            <Input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && messageText.trim() && handleSendMessage()}
                className="flex-grow"
                disabled={negotiation.status === NegotiationStatus.AGREED && !isBuyer } /* Allow buyer to message after agreement, before order */
            />
            <Button variant="primary" onClick={handleSendMessage} disabled={!messageText.trim() || (negotiation.status === NegotiationStatus.AGREED && !isBuyer )}>
                <IconSend className="w-5 h-5"/>
            </Button>
            </div>
        </div>
      )}
       {negotiation.status === NegotiationStatus.ORDER_PLACED && (
         <div className="p-4 text-center bg-green-100 text-green-700 font-semibold">Order has been placed!</div>
       )}
       {negotiation.status.startsWith('CANCELLED') && (
         <div className="p-4 text-center bg-red-100 text-red-700 font-semibold">Negotiation Cancelled.</div>
       )}
    </div>
  );
};

export default NegotiationChat;