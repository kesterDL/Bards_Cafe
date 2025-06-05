// src/components/common/MessageModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { MessageState } from '../../types';

interface MessageModalProps {
  message: string | null;
  type: MessageState['type'];
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-sky-500';
  const icon = type === 'success' ? '🎉' : type === 'error' ? '❗' : 'ℹ️';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className={`relative ${bgColor} text-white p-6 rounded-lg shadow-xl max-w-sm w-full`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-white hover:text-slate-200">
          <X size={24} />
        </button>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
