'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
