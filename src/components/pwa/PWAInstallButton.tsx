import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

interface Props {
  variant?: 'header' | 'hero' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'hero') {
      return (
        <button
          onClick={install}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-950/40 border border-rose-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Install Android App (APK / PWA)</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-xs font-semibold shadow-sm border border-red-500/30 transition-colors"
        title="Install FF TOURNAMENT PRO to Home Screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#121520] border border-rose-500/30 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center font-black text-white text-xs">
                    FF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
                    <p className="text-[11px] text-slate-400">FF TOURNAMENT PRO</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <Share2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Step 1: Tap Share</strong>
                    Tap the Share button in Safari bottom navigation bar.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <PlusSquare className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Step 2: Add to Home Screen</strong>
                    Scroll down in the action sheet and tap <strong>Add to Home Screen</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't trigger beforeinstallprompt yet (or already installed)
  return null;
};
