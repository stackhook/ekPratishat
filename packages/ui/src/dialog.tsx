"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  overlayClassName?: string;
}

// export function Dialog({ open, onOpenChange, children }: DialogProps) {
//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           {/* background overlay */}
//           <motion.div
//             className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
//             // onMouseDown={(e) => {
//             //   e.preventDefault();
//             //   e.stopPropagation();
//             //   onOpenChange(false);
//             // }}
//             onClick={(e) => {
//               onOpenChange(false);
//             }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           />
//           {/* modal container */}
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//           >
//             {children}
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

export function Dialog({ open, onOpenChange, children, overlayClassName }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <AnimatePresence>
      <>
        {/* background overlay */}
        <motion.div
          className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[5px]  ${overlayClassName}`}
          onClick={() => onOpenChange(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* modal container */}
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {children}
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export function DialogContent({
  children,
  onClose,
  className = "",
}: DialogContentProps) {
  return (
    <div
      className={`relative w-full max-w-lg rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 text-[var(--ek-text-primary)] shadow-[var(--ek-shadow-card)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] dark:text-[var(--ek-dark-text)] dark:shadow-[var(--ek-dark-shadow-card)] ${className}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-[var(--ek-text-muted)] transition-colors hover:bg-[rgba(154,106,0,0.08)] hover:text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-soft)] dark:hover:bg-[rgba(229,184,62,0.08)] dark:hover:text-[var(--ek-dark-text)]"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex flex-col space-y-4">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-3 text-lg font-semibold ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode, className?:string }) {
  return (
    <h2 className={`text-lg font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] ${className}`}>
      {children}
    </h2>
  );
}

export function DialogFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-5 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
