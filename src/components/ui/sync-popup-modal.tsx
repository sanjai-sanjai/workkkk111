import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ConfettiEffect } from './confetti-effect';
import { useSoundEffects } from '@/hooks/use-sound-effects';

interface SyncItem {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  failed: boolean;
}

interface SyncPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSyncing?: boolean;
  isSuccess?: boolean;
  lastSyncTime?: string;
  syncItems?: SyncItem[];
}

export function SyncPopupModal({
  isOpen,
  onClose,
  isSyncing = false,
  isSuccess = false,
  lastSyncTime,
  syncItems = [],
}: SyncPopupModalProps) {
  const { t } = useTranslation();
  const { playSyncSuccess } = useSoundEffects();
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [showSuccessContent, setShowSuccessContent] = useState(false);
  const soundPlayedRef = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Animate items one by one during sync
  useEffect(() => {
    if (isSyncing) {
      soundPlayedRef.current = false;
      setShowSuccessContent(false);
      setCompletedItems([]);
      
      // Stagger item completion (0.8s per item)
      syncItems.forEach((item, index) => {
        const timer = setTimeout(() => {
          setCompletedItems(prev => [...prev, item.id]);
        }, index * 800);

        return () => clearTimeout(timer);
      });
    }
  }, [isSyncing, syncItems]);

  // Handle success state - play sound ONCE only
  useEffect(() => {
    if (isSuccess && !isSyncing) {
      setShowConfetti(true);
      
      // Show success content after a brief delay
      const successTimer = setTimeout(() => {
        setShowSuccessContent(true);
      }, 800);

      // Play success sound ONLY ONCE at the very end
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        const soundTimer = setTimeout(() => {
          playSyncSuccess({ volume: 0.12 });
        }, 1200);
        
        return () => {
          clearTimeout(successTimer);
          clearTimeout(soundTimer);
        };
      }

      const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
      return () => {
        clearTimeout(successTimer);
        clearTimeout(confettiTimer);
      };
    }
  }, [isSuccess, isSyncing, playSyncSuccess]);

  // Accessibility - focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const closeButton = modalRef.current.querySelector('[aria-label="Close sync modal"]');
          (closeButton as HTMLElement)?.focus();
        }
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isSuccess && !isSyncing) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current && !isOpen) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, isSuccess, isSyncing, onClose]);

  if (!isOpen) return null;

  const formatSyncTime = (timestamp: string | undefined) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `Today at ${timeStr}`;
    } catch {
      return '';
    }
  };

  const modalContent = (
    <>
      <ConfettiEffect trigger={showConfetti} />
      
      {/* Backdrop - Glassmorphism friendly */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={isSuccess && !isSyncing ? onClose : undefined}
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
      >
        <div
          ref={modalRef}
          className={cn(
            'w-full max-w-sm pointer-events-auto rounded-2xl',
            'flex flex-col',
            'max-h-[85vh] overflow-hidden',
            !isSyncing && isSuccess ? 'animate-success-pop' : 'animate-modal-entrance'
          )}
          style={{
            background: 'rgba(20, 20, 40, 0.65)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isSuccess 
              ? '0 25px 50px rgba(34, 197, 94, 0.15), 0 10px 25px rgba(0, 0, 0, 0.3)'
              : '0 25px 50px rgba(147, 51, 234, 0.15), 0 10px 25px rgba(0, 0, 0, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Back Button + Title */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <button
              onClick={onClose}
              aria-label="Close sync modal"
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-white/10 active:scale-95',
                'text-gray-400 hover:text-white',
                isSyncing ? 'opacity-40 cursor-not-allowed' : ''
              )}
              disabled={isSyncing}
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h2 
              id="sync-modal-title"
              className="text-center text-sm font-heading font-semibold text-white flex-1"
            >
              {isSyncing ? 'Syncing...' : 'Sync Complete'}
            </h2>

            <div className="w-9" />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Large Center Icon */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24">
                {isSyncing ? (
                  // Syncing: Rotating circular arrows
                  <svg
                    className="w-24 h-24 text-purple-400 animate-sync-large-rotate"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2-8.83" />
                  </svg>
                ) : (
                  // Success: Green checkmark with ring
                  <>
                    <svg
                      className="absolute inset-0 w-24 h-24 text-emerald-500 animate-success-ring-large"
                      viewBox="0 0 96 96"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg
                      className="absolute inset-0 w-24 h-24 text-emerald-500"
                      viewBox="0 0 96 96"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M24 48L40 64L72 32"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="80"
                        strokeDashoffset="80"
                        className="animate-success-check-large"
                      />
                    </svg>
                  </>
                )}
              </div>
            </div>

            {/* Sync Items List */}
            <div className="space-y-2">
              {syncItems.map((item, index) => {
                const isCompleted = completedItems.includes(item.id);
                const isCurrent = !isCompleted && syncItems.slice(0, index).every(i => completedItems.includes(i.id));
                
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'px-4 py-3 rounded-lg flex items-center gap-3',
                      'transition-all duration-300',
                      isCompleted && 'bg-emerald-500/12 border border-emerald-500/25',
                      isCurrent && isSyncing && 'bg-purple-500/15 border border-purple-500/25 shadow-sm',
                      !isCompleted && !isCurrent && 'bg-white/3 border border-white/5',
                    )}
                    style={{
                      opacity: isCompleted || isSyncing ? 1 : 0.5,
                      animation: isCompleted ? `slideInFromLeft 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
                    }}
                  >
                    {/* Status Indicator */}
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {isCompleted ? (
                        <svg
                          className="w-6 h-6 text-emerald-400 animate-check-morph"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M5 12L10 17L19 8"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="30"
                            strokeDashoffset="30"
                            className="animate-check-draw"
                          />
                        </svg>
                      ) : isCurrent && isSyncing ? (
                        <div className="relative w-2 h-2">
                          <div className="absolute inset-0 rounded-full bg-purple-400 animate-dot-pulse" />
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-600/50" aria-hidden="true" />
                      )}
                    </div>

                    {/* Item Label & Icon */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0" aria-hidden="true">{item.icon}</span>
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isCompleted ? 'text-emerald-300' : 'text-gray-300'
                      )}>
                        {item.label}
                      </p>
                    </div>

                    {/* Completion Badge */}
                    {isCompleted && (
                      <span className="text-xs font-bold text-emerald-400 flex-shrink-0">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Success Message - Appears after completion */}
            {showSuccessContent && isSuccess && (
              <div className="space-y-4 pt-4 border-t border-white/5 animate-fade-in">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-heading font-bold text-emerald-400">
                    Data Synced Successfully!
                  </h3>
                  <p className="text-sm text-gray-300">
                    Your learning progress is now safely saved.
                  </p>
                </div>

                {/* Timestamp */}
                {lastSyncTime && (
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>Last synced: {formatSyncTime(lastSyncTime)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {isSuccess && !isSyncing && (
            <div className="px-6 py-6 border-t border-white/5">
              <Button
                onClick={onClose}
                className={cn(
                  'w-full h-12 font-heading font-bold text-base',
                  'rounded-lg transition-all duration-200',
                  'flex items-center justify-center gap-2',
                  'hover:scale-[1.01] active:scale-[0.99]',
                  'shadow-lg hover:shadow-xl'
                )}
                style={{
                  background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(34, 211, 238) 100%)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <span>Awesome! Continue Learning</span>
                <BookOpen className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Disabled Button During Sync */}
          {isSyncing && (
            <div className="px-6 py-6 border-t border-white/5">
              <Button
                disabled
                className="w-full h-12"
              >
                Syncing...
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-entrance {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes success-pop {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes sync-large-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes success-ring-large {
          0% {
            stroke-dasharray: 276;
            stroke-dashoffset: 276;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dasharray: 276;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes success-check-large {
          0% {
            stroke-dashoffset: 80;
            opacity: 0;
          }
          30% {
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes check-morph {
          from {
            stroke-dashoffset: 30;
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes check-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes dot-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-modal-entrance {
          animation: modal-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-success-pop {
          animation: success-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-sync-large-rotate {
          animation: sync-large-rotate 5s linear infinite;
        }

        .animate-success-ring-large {
          animation: success-ring-large 0.8s ease-out forwards;
        }

        .animate-success-check-large {
          animation: success-check-large 0.8s ease-out forwards;
          animation-delay: 0.3s;
        }

        .animate-check-morph {
          animation: check-morph 0.4s ease-out forwards;
        }

        .animate-check-draw {
          animation: check-draw 0.4s ease-out forwards;
        }

        .animate-dot-pulse {
          animation: dot-pulse 1.2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
