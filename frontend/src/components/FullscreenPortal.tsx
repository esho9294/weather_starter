import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface FullscreenPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isTransitioning?: boolean;
}

export function FullscreenPortal({
  isOpen,
  onClose,
  children,
  isTransitioning = false,
}: FullscreenPortalProps) {
  // Prevent body scroll when portal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isTransitioning) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isTransitioning]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black w-screen h-screen transition-all duration-500">
      {/* Close button in top-right corner */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-[1000] rounded-lg bg-white/90 p-2 shadow-lg backdrop-blur-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Exit fullscreen"
        disabled={isTransitioning}
      >
        <svg
          className="h-5 w-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Portal content */}
      <div className="h-full w-full">{children}</div>
    </div>,
    document.body,
  );
}
