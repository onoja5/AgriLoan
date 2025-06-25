
import React, { useState } from 'react';
import { ProduceListing, CropType, QualityGrade } from '../../types';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import TextArea from '../common/TextArea';
import FileUpload from '../common/FileUpload';
import { CROP_TYPES_ARRAY, QUALITY_GRADES_ARRAY } from '../../constants';

interface ProduceListingFormProps {
  onClose: () => void;
  existingListing?: ProduceListing; // For editing, not implemented
}

const ProduceListingForm: React.FC<ProduceListingFormProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { addProduceListing, generateId } = useAppData();

  const [cropType, setCropType] = useState<CropType>(CropType.MAIZE);
  const [otherCropType, setOtherCropType] = useState('');
  const [quantityKg, setQuantityKg] = useState<number | ''>('');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>(QualityGrade.A);
  const [pricePerKg, setPricePerKg] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cropType || !quantityKg || !qualityGrade || !pricePerKg) {
      setError('Please fill all required fields.');
      return;
    }
    if (cropType === CropType.OTHER && !otherCropType) {
        setError('Please specify the crop type if "Other" is selected.');
        return;
    }

    const newListing: ProduceListing = {
      id: generateId(),
      farmerId: currentUser.id,
      farmerName: currentUser.profile.fullName,
      cropType: cropType,
      otherCropType: cropType === CropType.OTHER ? otherCropType : undefined,
      quantityKg: Number(quantityKg),
      qualityGrade,
      pricePerKg: Number(pricePerKg),
      listingDate: new Date().toISOString(),
      status: 'AVAILABLE',
      description,
      photoFileName: photoFile?.name, // In real app, upload and get URL/ID
    };

    addProduceListing(newListing);
    // Here you would handle file upload to a server
    // For now, we just store the name
    if (photoFile) {
        console.log("Simulating upload of:", photoFile.name);
    }
    onClose();
  };

  const cropOptions = CROP_TYPES_ARRAY.map(ct => ({ value: ct, label: ct }));
  const qualityGradeOptions = QUALITY_GRADES_ARRAY.map(qg => ({ value: qg, label: qg }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      <Select
        label="Crop Type"
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
      <Input
        label="Quantity (KG)"
        type="number"
        value={quantityKg}
        onChange={(e) => setQuantityKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
        min="1"
        required
      />
      <Select
        label="Quality Grade"
        options={qualityGradeOptions}
        value={qualityGrade}
        onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
        required
      />
      <Input
        label="Price per KG (NGN)"
        type="number"
        value={pricePerKg}
        onChange={(e) => setPricePerKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
        min="1"
        required
      />
      <TextArea
        label="Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <FileUpload
        id="producePhoto"
        label="Upload Produce Photo (Optional)"
        onFileSelect={setPhotoFile}
        accept="image/*"
        fileTypeIcon="camera"
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">List Produce</Button>
      </div>
    </form>
  );
};

export default ProduceListingForm;
