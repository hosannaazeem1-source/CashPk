
import React from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error';
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const baseClasses = 'p-4 mb-4 text-sm rounded-lg';
  const typeClasses = {
    success: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200',
    error: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {message}
    </div>
  );
};

export default Alert;
