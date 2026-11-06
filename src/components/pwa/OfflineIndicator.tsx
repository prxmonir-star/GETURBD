import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs shadow-2xl border border-amber-400 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-bounce" />
        <span>Offline Mode Active — Cached match and wallet data loaded.</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 rounded-lg bg-black text-amber-400 font-bold hover:bg-neutral-900 transition-colors"
      >
        Retry
      </button>
    </div>
  );
};
