import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Bell, Download, Copy, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'reminder' | 'error';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto p-4 rounded-2xl border-2 border-[#2A1A14] shadow-[5px_5px_0px_#2A1A14] flex items-start gap-3 relative ${
              toast.type === 'success'
                ? 'bg-[#F3E6CE] text-[#2A1A14]'
                : toast.type === 'reminder'
                ? 'bg-[#FFF6E5] text-[#2A1A14]'
                : toast.type === 'error'
                ? 'bg-[#8E2A2A] text-[#FFF6E5]'
                : 'bg-[#A98258] text-[#FFF6E5]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#5B7A3A]" />}
              {toast.type === 'reminder' && <Bell className="w-5 h-5 text-[#8A1F6E]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#FFF6E5]" />}
              {toast.type === 'info' && <CheckCircle2 className="w-5 h-5 text-[#FFF6E5]" />}
            </div>

            <div className="flex-1 font-typewriter min-w-0 pr-4">
              <span className="font-display font-black text-sm block leading-tight">
                {toast.title}
              </span>
              {toast.description && (
                <span className="text-[11px] opacity-80 block mt-0.5 leading-snug">
                  {toast.description}
                </span>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="absolute top-3 right-3 text-inherit opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
