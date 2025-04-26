import type React from 'react';
import { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopyClick}
      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-md 
        text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
        transition-all duration-300 ${isCopied ? 'bg-green-100 border-green-400 text-green-700' : ''}`}
    >
      {isCopied ? (
        <span className="flex items-center space-x-1">
          <span>Copied</span>
        </span>
      ) : (
        <span className="flex items-center space-x-1">
          <span>Copy</span>
        </span>
      )}
    </button>
  );
};

export default CopyButton;
