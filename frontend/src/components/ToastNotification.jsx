import React from 'react';

/**
 * ============================================================================
 * 📁 Fichier : ToastNotification.jsx
 * 🎨 Rôle : Affichage design des messages de succès / erreur
 * 💡 Remplace tous les `window.alert()` par des bannières flottantes premium
 * ============================================================================
 */
export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error' || !toast.type;

  return (
    <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-[9999] flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.15)] border border-gray-100 text-sm font-bold text-gray-800 transition-all duration-300 animate-in fade-in slide-in-from-top-4 max-w-md">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-inner ${
        isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
      }`}>
        {isSuccess ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      <div className="flex-1 pr-2">
        <p className="text-gray-900 leading-snug">{toast.message}</p>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
