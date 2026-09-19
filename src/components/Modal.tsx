import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  accent?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, subtitle, accent = '#22d3ee', onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="glass-strong relative w-full max-w-5xl max-h-[88vh] rounded-2xl flex flex-col overflow-hidden"
            style={{ borderColor: `${accent}44`, boxShadow: `0 0 0 1px ${accent}22, 0 40px 120px -40px ${accent}55` }}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          >
            <header
              className="flex items-center gap-3 px-5 h-14 border-b border-white/[0.07] shrink-0"
              style={{ background: `linear-gradient(90deg, ${accent}1f, transparent 75%)` }}
            >
              <span className="h-2.5 w-2.5 rounded-full animate-pulse-glow" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
              <div className="flex flex-col leading-none">
                <span className="font-mono text-sm font-semibold tracking-wider uppercase" style={{ color: accent }}>{title}</span>
                {subtitle && <span className="font-mono text-[10px] text-ink-dim mt-0.5">{subtitle}</span>}
              </div>
              <button onClick={onClose} className="ml-auto p-2 rounded-lg hover:bg-white/10 text-ink-dim hover:text-flux transition-colors">
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 min-h-0 overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
