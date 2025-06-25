import React from 'react';
import Modal from '../common/Modal';
import { FieldLog } from '../../types';
import { formatDate } from '../../utils/helpers';
import { IconSparkles, IconInfo } from '../../constants';

interface AiAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: FieldLog | null;
  advice: string | null;
  isLoading: boolean;
  error: string | null;
}

const AiAdviceModal: React.FC<AiAdviceModalProps> = ({ isOpen, onClose, log, advice, isLoading, error }) => {
  if (!isOpen || !log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Crop Advisor" size="lg">
      <div className="p-2">
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-semibold text-green-700">Field Log Details:</h4>
            <p className="text-xs text-gray-600">
                <span className="font-medium">Plot/Crop:</span> {log.cropPlotId} <br />
                <span className="font-medium">Activity:</span> {log.activity} on {formatDate(log.date)} <br />
                <span className="font-medium">Notes:</span> <span className="italic whitespace-pre-wrap">"{log.notes}"</span>
            </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40">
            <IconSparkles className="w-10 h-10 text-green-500 animate-pulse" />
            <p className="mt-3 text-green-600">Fetching advice from AI assistant...</p>
            <p className="text-xs text-gray-500">This may take a moment.</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <div className="flex items-center">
                <IconInfo className="w-5 h-5 mr-2" />
                <p className="font-semibold">Error Fetching Advice</p>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!isLoading && !error && advice && (
          <div>
            <h4 className="text-md font-semibold text-green-700 mb-2 flex items-center">
                <IconSparkles className="w-5 h-5 mr-2 text-yellow-500"/> AI Generated Advice:
            </h4>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{advice}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              Note: This advice is AI-generated and should be used as a suggestion. Always consult with local agricultural experts for critical decisions.
            </p>
          </div>
        )}
         {!isLoading && !error && !advice && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-center">
                <p>No advice available at the moment. Try again or check details.</p>
            </div>
         )}
      </div>
    </Modal>
  );
};

export default AiAdviceModal;
