import React, { useState } from 'react';
import { LoanApplication, CropType, LoanStatus } from '../../types';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import TextArea from '../common/TextArea';
import { CROP_TYPES_ARRAY } from '../../constants';

interface LoanApplicationFormProps {
  onClose: () => void;
  existingLoan?: LoanApplication; // For editing, not implemented in this version
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { addLoan, generateId } = useAppData();

  const [farmSizeAcres, setFarmSizeAcres] = useState<number | ''>('');
  const [cropType, setCropType] = useState<CropType>(CropType.MAIZE);
  const [otherCropType, setOtherCropType] = useState('');
  const [inputNeeds, setInputNeeds] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number | ''>('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!farmSizeAcres || !cropType || !inputNeeds || !requestedAmount || !expectedHarvestDate) {
      setError('Please fill all required fields.');
      return;
    }
    if (cropType === CropType.OTHER && !otherCropType) {
        setError('Please specify the crop type if "Other" is selected.');
        return;
    }

    const newLoan: LoanApplication = {
      id: generateId(),
      farmerId: currentUser.id,
      farmerName: currentUser.profile.fullName,
      farmSizeAcres: Number(farmSizeAcres),
      cropType: cropType,
      otherCropType: cropType === CropType.OTHER ? otherCropType : undefined,
      inputNeeds,
      requestedAmount: Number(requestedAmount),
      applicationDate: new Date().toISOString(),
      status: LoanStatus.PENDING_ADMIN_REVIEW, // Changed initial status
      repayments: [],
      expectedHarvestDate,
    };

    addLoan(newLoan);
    onClose();
  };

  const cropOptions = CROP_TYPES_ARRAY.map(ct => ({ value: ct, label: ct }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      <Input
        label="Farm Size (Acres)"
        type="number"
        value={farmSizeAcres}
        onChange={(e) => setFarmSizeAcres(e.target.value === '' ? '' : parseFloat(e.target.value))}
        min="0.1"
        step="0.1"
        required
      />
      <Select
        label="Primary Crop Type"
        options={cropOptions}
        value={cropType}
        onChange={(e) => setCropType(e.target.value as CropType)}
        required
      />
      {cropType === CropType.OTHER && (
        <Input
          label="Specify Other Crop Type"
          type="text"
          value={otherCropType}
          onChange={(e) => setOtherCropType(e.target.value)}
          required
        />
      )}
      <TextArea
        label="Input Needs (e.g., Fertilizer, Seeds, Labor)"
        value={inputNeeds}
        onChange={(e) => setInputNeeds(e.target.value)}
        rows={2}
        required
      />
      <Input
        label="Requested Loan Amount (NGN)"
        type="number"
        value={requestedAmount}
        onChange={(e) => setRequestedAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
        min="1000"
        step="1000"
        required
      />
      <Input
        label="Expected Harvest Date"
        type="date"
        value={expectedHarvestDate}
        onChange={(e) => setExpectedHarvestDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]} // Today onwards
        required
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Submit Application</Button>
      </div>
    </form>
  );
};

export default LoanApplicationForm;