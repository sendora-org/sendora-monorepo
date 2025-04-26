// CopyButton.tsx
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
      }, 2000); // 2 秒后恢复
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <button
      onClick={handleCopyClick}
      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 rounded-md 
        text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
        transition-all duration-300 ${isCopied ? 'bg-green-100 border-green-400 text-green-700' : ''}`}
    >
      {isCopied ? (
        <span className="flex items-center space-x-1">
          <svg
            className="h-5 w-5 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Copied</span>
        </span>
      ) : (
        <span className="flex items-center space-x-1">
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2"
            />
          </svg>
          <span>Copy</span>
        </span>
      )}
    </button>
  );
};

export default CopyButton;
