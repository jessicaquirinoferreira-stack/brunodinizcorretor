import React, { useEffect, useState } from 'react';

export function LgpdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('bd_lgpd_accepted');
      if (!accepted) {
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem('bd_lgpd_accepted', '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-5 z-30 w-auto sm:w-full max-w-md rounded-xl border border-white/15 bg-[#131317]/95 backdrop-blur-md p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-[#A19E95] leading-relaxed">
          Utilizamos cookies essenciais e métricas de navegação para melhorar sua experiência, conforme a LGPD.
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-[#C6A15B] px-3.5 py-2 text-xs font-semibold text-[#0B0B0D] hover:bg-[#D8B573] transition-colors whitespace-nowrap"
        >
          Concordar
        </button>
      </div>
    </div>
  );
}
