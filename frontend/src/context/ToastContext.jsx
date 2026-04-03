import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error', 6000), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '#10b981', text: '#6ee7b7' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  icon: '#ef4444', text: '#fca5a5' },
    info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: '#3b82f6', text: '#93c5fd' },
  };

  return (
    <ToastContext.Provider value={{ success, error, info, addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        maxWidth: 420, pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = icons[toast.type] || Info;
            const c = colors[toast.type] || colors.info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  pointerEvents: 'auto',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '14px 16px',
                  background: c.bg,
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid ${c.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <Icon size={18} color={c.icon} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{
                  flex: 1, margin: 0,
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: c.text, lineHeight: 1.5,
                }}>
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 0, flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
