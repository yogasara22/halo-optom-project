import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import './WYSIWYGEditor.css';

// Dynamically import TipTap editor to avoid SSR issues
const TiptapEditor = dynamic(() => import('./TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl"></div>,
});

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis deskripsi produk di sini...',
  error,
  className,
}) => {
  // State to handle editor initialization
  const [isClient, setIsClient] = useState(false);
  
  // Only render the editor on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full">
      <div className={`${error ? 'border-red-300' : 'border-gray-200/50'} border rounded-2xl overflow-hidden ${className}`}>
        {isClient ? (
          <TiptapEditor
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        ) : (
          <div className="h-64 w-full bg-gray-100 rounded-2xl p-4">
            {value || placeholder}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default WYSIWYGEditor;