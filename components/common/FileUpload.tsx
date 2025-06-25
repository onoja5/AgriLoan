
import React, { useState, useRef } from 'react';
import Button from './Button';
import { IconCamera, IconDocumentText } from '../../constants';

interface FileUploadProps {
  id: string;
  label?: string;
  onFileSelect: (file: File | null) => void;
  accept?: string; // e.g., "image/*", ".pdf"
  fileTypeIcon?: 'camera' | 'document';
}

const FileUpload: React.FC<FileUploadProps> = ({ id, label, onFileSelect, accept, fileTypeIcon = 'document' }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFileName(file?.name || null);
    onFileSelect(file);
  };

  const Icon = fileTypeIcon === 'camera' ? IconCamera : IconDocumentText;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="mt-1 flex items-center space-x-2">
        <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Icon className="w-4 h-4" />}
        >
            {fileName ? 'Change File' : 'Choose File'}
        </Button>
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        {fileName && <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>}
      </div>
      {!fileName && <p className="text-xs text-gray-500 mt-1">No file chosen. {accept ? `Accepts: ${accept}` : ''}</p>}
    </div>
  );
};

export default FileUpload;
