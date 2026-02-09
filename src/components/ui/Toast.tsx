'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}

const bgColors: Record<ToastProps['type'], string> = {
  info: 'bg-blue-600',
  error: 'bg-red-600',
  success: 'bg-green-600',
};

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <div
        className={`pointer-events-auto rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${bgColors[type]}`}
      >
        {message}
      </div>
    </div>
  );
}
