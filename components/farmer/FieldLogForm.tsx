
import React, { useState } from 'react';
import { FieldLog, FieldLogActivity, LoanApplication } from '../../types';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import TextArea from '../common/TextArea';
import FileUpload from '../common/FileUpload';
import { FIELD_LOG_ACTIVITIES_ARRAY } from '../../constants';

interface FieldLogFormProps {
  onClose: () => void;
  activeLoans: LoanApplication[]; // To associate log with a loan (optional)
}

const FieldLogForm: React.FC<FieldLogFormProps> = ({ onClose, activeLoans }) => {
  const { currentUser } = useAuth();
  const { addFieldLog, generateId } = useAppData();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cropPlotId, setCropPlotId] = useState('');
  const [activity, setActivity] = useState<FieldLogActivity>(FieldLogActivity.OBSERVATION);
  const [notes, setNotes] = useState('');
  const [estimatedYieldKg, setEstimatedYieldKg] = useState<number | ''>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !cropPlotId || !activity || !notes) {
      setError('Date, Plot/Crop ID, Activity, and Notes are required.');
      return;
    }

    const newLog: FieldLog = {
      id: generateId(),
      farmerId: currentUser.id,
      loanId: selectedLoanId,
      cropPlotId,
      date,
      activity,
      notes,
      estimatedYieldKg: estimatedYieldKg === '' ? undefined : Number(estimatedYieldKg),
      photoFileName: photoFile?.name, // Store name, real upload handled elsewhere
      isSynced: false, // Will be set to true by AppDataContext
    };

    addFieldLog(newLog);
    // Simulate photo upload
    if (photoFile) console.log("Simulating photo upload for field log:", photoFile.name);
    onClose();
  };
  
  const loanOptions = activeLoans
    .filter(loan => loan.status === 'ACTIVE' || loan.status === 'APPROVED') // Only show relevant loans
    .map(loan => ({
      value: loan.id,
      label: `${loan.cropType} (Loan ending ${new Date(loan.expectedHarvestDate || loan.repaymentDueDate || '').toLocaleDateString()})`
    }));


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</p>}
      <Input
        label="Date of Activity"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().split('T')[0]} // Not in future
        required
      />
      <Input
        label="Crop / Plot Identifier"
        type="text"
        value={cropPlotId}
        onChange={(e) => setCropPlotId(e.target.value)}
        placeholder="e.g., Maize Plot A, Tomato Section 2"
        required
      />
       {loanOptions.length > 0 && (
        <Select
          label="Link to Loan (Optional)"
          options={[{ value: '', label: 'None' }, ...loanOptions]}
          value={selectedLoanId || ''}
          onChange={(e) => setSelectedLoanId(e.target.value || undefined)}
        />
      )}
      <Select
        label="Activity Type"
        options={FIELD_LOG_ACTIVITIES_ARRAY.map(act => ({ value: act, label: act }))}
        value={activity}
        onChange={(e) => setActivity(e.target.value as FieldLogActivity)}
        required
      />
      <TextArea
        label="Notes / Observations"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        required
      />
      <Input
        label="Estimated Yield (KG) - Optional"
        type="number"
        value={estimatedYieldKg}
        onChange={(e) => setEstimatedYieldKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
        min="0"
      />
      <FileUpload
        id="fieldLogPhoto"
        label="Upload Photo Log (Optional)"
        onFileSelect={setPhotoFile}
        accept="image/*"
        fileTypeIcon="camera"
      />
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Save Log</Button>
      </div>
    </form>
  );
};

export default FieldLogForm;
