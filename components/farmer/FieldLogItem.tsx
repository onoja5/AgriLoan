import React from 'react';
import { FieldLog } from '../../types';
import { formatDate } from '../../utils/helpers';
import { IconCamera, IconCalendar, IconInfo, IconSparkles } from '../../constants'; 
import Button from '../common/Button';

interface FieldLogItemProps {
  log: FieldLog;
  onGetAiAdvice: (log: FieldLog) => void;
}

const FieldLogItem: React.FC<FieldLogItemProps> = ({ log, onGetAiAdvice }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-semibold text-green-700">{log.cropPlotId} - <span className="font-normal">{log.activity}</span></h3>
        <span className="text-xs text-gray-500 flex items-center">
            <IconCalendar className="w-3 h-3 mr-1" />
            {formatDate(log.date)}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{log.notes}</p>
      <div className="text-xs text-gray-500 space-y-1">
        {log.estimatedYieldKg !== undefined && ( // Check for undefined as 0 is a valid yield
          <p>Estimated Yield: {log.estimatedYieldKg} kg</p>
        )}
        {log.photoFileName && (
          <div className="flex items-center text-blue-600">
            <IconCamera className="w-4 h-4 mr-1" />
            <span>{log.photoFileName} (Photo log)</span>
          </div>
        )}
         {log.loanId && (
            <p className="flex items-center text-purple-600"><IconInfo className="w-3 h-3 mr-1" />Linked to loan ID: ...{log.loanId.slice(-4)}</p>
         )}
        <p className={`font-medium ${log.isSynced ? 'text-green-500' : 'text-yellow-500'}`}>
          {log.isSynced ? 'Synced' : 'Saved Locally'}
        </p>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => onGetAiAdvice(log)} 
        className="mt-3 w-full sm:w-auto"
        leftIcon={<IconSparkles className="w-4 h-4" />}
      >
        Get AI Advice
      </Button>
    </div>
  );
};

export default FieldLogItem;
