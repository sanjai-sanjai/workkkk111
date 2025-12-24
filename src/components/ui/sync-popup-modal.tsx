import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock, CheckCircle2, ArrowRight, X } from 'lucide-react';
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
      
      // Reset completed items when sync starts
      setCompletedItems([]);
      
      // Animate each item sequentially every 400ms
      syncItems.forEach((item, index) => {
        const timer = setTimeout(() => {
          setCompletedItems(prev => [...prev, item.id]);
        }, index * 400); // 400ms interval as per spec

        return () => clearTimeout(timer);
      });
    }
  }, [isSyncing, syncItems]);

  // Handle success state
  useEffect(() => {
    if (isSuccess && !isSyncing) {
      setShowConfetti(true);
      
      // Delay showing success content to allow checkmark animation
      const successTimer = setTimeout(() => {
        setShowSuccessContent(true);
      }, 600);

      // Play sound once when all steps complete
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        // Delay sound slightly to sync with checkmark animation
        const soundTimer = setTimeout(() => {
          playSyncSuccess({ volume: 0.15 });
        }, 800);
        
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

  // Focus management and keyboard handling
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Find the close button and focus it
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const closeButton = modalRef.current.querySelector('button');
          closeButton?.focus();
        }
      }, 100);

      // Handle keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        // Close modal on Escape
        if (e.key === 'Escape' && isSuccess && !isSyncing) {
          onClose();
        }
        
        // Prevent tab from leaving the modal
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
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

  const hasFailedItems = syncItems.some(item => item.failed);

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
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] bg-black/50 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Centered Modal - Glassmorphic design */}
      <div 
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
      >
        <div
          ref={modalRef}
          className={cn(
            'w-full max-w-md pointer-events-auto rounded-3xl',
            'backdrop-blur-2xl border border-purple-500/20',
            'shadow-2xl',
            'p-8 sm:p-10',
            'animate-pop',
            'flex flex-col gap-6',
            'max-h-[90vh] overflow-y-auto relative'
          )}
          style={{
            background: 'linear-gradient(180deg, rgba(30,27,60,0.9) 0%, rgba(15,12,30,0.95) 100%)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back Button - Top Right Corner */}
          {!isSyncing && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-gray-300 hover:text-white"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Header - Success Icon */}
          {isSuccess && !hasFailedItems && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                {/* Animated ring */}
                <svg
                  className="absolute inset-0 w-20 h-20 transform -rotate-90"
                  viewBox="0 0 80 80"
                  aria-hidden="true"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.2)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="2"
                    strokeDasharray="226.19"
                    strokeDashoffset="226.19"
                    className="animate-success-ring"
                  />
                </svg>
                
                {/* Checkmark */}
                <svg
                  className="absolute inset-0 w-20 h-20"
                  viewBox="0 0 80 80"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24 40L36 52L56 28"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="48"
                    strokeDashoffset="48"
                    className="animate-success-check"
                  />
                </svg>
              </div>

              <div className="text-center">
                <h2 
                  id="sync-modal-title"
                  className="text-2xl font-heading font-bold text-white mb-2"
                >
                  {t('sync.successTitle')}
                </h2>
                <p className="text-sm text-gray-300">
                  {t('sync.successSubtitle')}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSyncing && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div
                  className={cn(
                    'absolute inset-0 rounded-full',
                    'border-4 border-transparent border-t-purple-400 border-r-purple-400',
                    'animate-spin'
                  )}
                  aria-hidden="true"
                />
              </div>
              <h2 id="sync-modal-title" className="text-2xl font-heading font-bold text-white">
                {t('sync.syncing')}
              </h2>
            </div>
          )}

          {/* Animated Sync Timeline */}
          <div className="space-y-2">
            {syncItems.map((item, index) => {
              const isCompleted = completedItems.includes(item.id);
              const isCurrent = !isCompleted && syncItems.slice(0, index).every(i => completedItems.includes(i.id));

              return (
                <div
                  key={item.id}
                  className={cn(
                    'px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-500',
                    isCompleted && 'bg-green-500/20 border border-green-500/40 shadow-sm',
                    isCurrent && isSyncing && 'bg-purple-500/25 border border-purple-500/40 shadow-sm',
                    !isCompleted && !isCurrent && 'bg-slate-700/15 border border-slate-700/10',
                  )}
                  style={{
                    opacity: isCompleted || isSyncing ? 1 : 0.5,
                    animation: isCompleted ? `slideInSync 0.4s ease-out forwards` : 'none',
                  }}
                >
                  {/* Icon - sync arrows or checkmark */}
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 10L8 13L15 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-success-check-small"
                        />
                      </svg>
                    ) : isCurrent && isSyncing ? (
                      <svg
                        className="w-5 h-5 text-purple-400 animate-sync-arrows"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-500/50"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Label and icon */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-sm" aria-hidden="true">{item.icon}</span>
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isCompleted ? 'text-green-300' : 'text-gray-200'
                    )}>
                      {item.label}
                    </p>
                  </div>

                  {/* Status */}
                  {isCompleted && (
                    <span className="text-xs font-medium text-green-300" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Summary - Show only after all steps complete */}
          {showSuccessContent && isSuccess && !hasFailedItems && (
            <div className="space-y-4 border-t border-purple-500/10 pt-4 animate-fade-in">
              {/* Summary list with green checks */}
              <div className="space-y-2">
                {syncItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-200">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Timestamp */}
              {lastSyncTime && (
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-purple-500/10">
                  <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <p className="text-xs text-gray-400">
                    {t('sync.lastSynced')}: {formatSyncTime(lastSyncTime)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Button - Only show when success */}
          {isSuccess && !hasFailedItems && !isSyncing && (
            <Button
              onClick={onClose}
              className={cn(
                'w-full h-14 font-heading font-bold text-lg',
                'rounded-xl transition-all duration-200',
                'relative overflow-hidden',
                'hover:scale-[1.02] active:scale-95',
                'shadow-lg hover:shadow-xl'
              )}
              style={{
                background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(147, 51, 234) 100%)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              }}
              aria-label={t('sync.continueButton')}
            >
              <span className="relative z-10">
                {t('sync.continueButton')}
              </span>
            </Button>
          )}

          {/* Disabled button during sync */}
          {isSyncing && (
            <Button
              disabled
              className="w-full h-12"
              size="lg"
              aria-busy="true"
            >
              {t('sync.syncing')}
            </Button>
          )}

          {/* Error state buttons */}
          {hasFailedItems && !isSuccess && (
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {t('sync.close')}
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
                size="lg"
              >
                {t('sync.retrySync')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInSync {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes success-ring {
          0% {
            stroke-dashoffset: 226.19;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes success-check {
          0% {
            stroke-dashoffset: 48;
            opacity: 0;
          }
          50% {
            opacity: 0;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes success-check-small {
          from {
            stroke-dashoffset: 20;
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes pulse-check {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes smooth-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.75;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-success-ring {
          animation: success-ring 0.8s ease-out forwards;
        }

        .animate-success-check {
          animation: success-check 0.8s ease-out forwards;
          animation-delay: 0.3s;
        }

        .animate-success-check-small {
          animation: success-check-small 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .animate-pop {
          animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
