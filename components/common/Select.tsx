
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string; // Added placeholder to props interface
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, className = '', placeholder, ...restProps }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          form-select block w-full sm:text-sm rounded-md
          border-gray-300 focus:ring-green-500 focus:border-green-500
          ${error ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...restProps} // Use restProps to avoid passing unknown attributes like placeholder to select
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Select;