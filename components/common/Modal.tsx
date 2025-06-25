
import React, { ReactNode } from 'react';
import { IconXCircle } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div 
            className={`bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle w-full p-6 ${sizeClasses[size]}`}
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-green-700" id="modal-title">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <IconXCircle className="h-6 w-6" />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
