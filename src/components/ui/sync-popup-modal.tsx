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
      
      // Animate each item sequentially every 400ms
      syncItems.forEach((item, index) => {
        const timer = setTimeout(() => {
          setCompletedItems(prev => [...prev, item.id]);
        }, index * 400);

        return () => clearTimeout(timer);
      });
    }
  }, [isSyncing, syncItems]);

  // Handle success state
  useEffect(() => {
    if (isSuccess && !isSyncing) {
      setShowConfetti(true);
      
      // Delay showing success content
      const successTimer = setTimeout(() => {
        setShowSuccessContent(true);
      }, 600);

      // Play sound ONCE when all steps complete
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        // Delay sound to sync with animations
        const soundTimer = setTimeout(() => {
          playSyncSuccess({ volume: 0.15 });
        }, 1000);
        
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

  const borderColor = isSuccess ? 'border-emerald-500/40' : 'border-purple-500/40';
  const glowColor = isSuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(147, 51, 234, 0.15)';

  const modalContent = (
    <>
      <ConfettiEffect trigger={showConfetti} />
      
      {/* Backdrop - Enhanced Glassmorphism */}
      <div
        className={cn(
          'fixed inset-0 z-[100] backdrop-blur-sm transition-all duration-500',
          isSuccess && !isSyncing ? 'bg-black/30' : 'bg-black/40'
        )}
        aria-hidden="true"
        style={{
          backdropFilter: 'blur(4px)',
        }}
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
            'w-full max-w-md pointer-events-auto rounded-3xl',
            'backdrop-blur-2xl border-2',
            borderColor,
            'shadow-2xl',
            'flex flex-col',
            'max-h-[90vh] overflow-hidden',
            'animate-modal-pop'
          )}
          style={{
            background: 'linear-gradient(180deg, rgba(30, 20, 60, 0.85) 0%, rgba(15, 10, 35, 0.9) 100%)',
            boxShadow: `0 0 40px ${glowColor}, 0 8px 32px rgba(0, 0, 0, 0.4)`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar - Status Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/10">
            {/* Back Button */}
            <button
              onClick={onClose}
              aria-label="Close sync modal"
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-white/10 active:scale-95',
                'text-gray-300 hover:text-white',
                isSyncing ? 'opacity-50 cursor-not-allowed' : ''
              )}
              disabled={isSyncing}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Center Title */}
            <h2 
              id="sync-modal-title"
              className="text-base font-heading font-bold text-white text-center flex-1 px-4"
            >
              {isSyncing 
                ? t('sync.syncing') 
                : isSuccess 
                  ? 'Data Synced Successfully'
                  : t('sync.readyToSync')}
            </h2>

            {/* Right Spacer */}
            <div className="w-10" />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Circular Progress Ring - Syncing State */}
            {isSyncing && (
              <div className="flex justify-center py-4">
                <div className="relative w-24 h-24">
                  {/* Animated circular progress */}
                  <svg
                    className="absolute inset-0 w-24 h-24 transform -rotate-90"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(147, 51, 234, 0.1)"
                      strokeWidth="3"
                    />
                    {/* Animated gradient progress */}
                    <defs>
                      <linearGradient id="syncGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                        <stop offset="100%" stopColor="rgb(34, 211, 238)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#syncGradient)"
                      strokeWidth="3"
                      strokeDasharray="282.6"
                      strokeDashoffset="70"
                      strokeLinecap="round"
                      className="animate-sync-progress"
                    />
                  </svg>

                  {/* Center Sync Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-purple-400 animate-sync-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Success Icon - Final State */}
            {isSuccess && !isSyncing && (
              <div className="flex justify-center py-2">
                <div className="relative w-20 h-20">
                  {/* Success ring */}
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
                      strokeDashoffset="0"
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
                      strokeDashoffset="0"
                      className="animate-success-check"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Sync Items List */}
            <div className="space-y-3">
              {syncItems.map((item, index) => {
                const isCompleted = completedItems.includes(item.id);
                const isCurrent = !isCompleted && syncItems.slice(0, index).every(i => completedItems.includes(i.id));
                
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'px-4 py-3 rounded-lg flex items-center gap-3',
                      'transition-all duration-300',
                      isCompleted && 'bg-emerald-500/15 border border-emerald-500/30 shadow-sm',
                      isCurrent && isSyncing && 'bg-purple-500/20 border border-purple-500/30 shadow-sm',
                      !isCompleted && !isCurrent && 'bg-slate-700/10 border border-slate-700/5',
                    )}
                    style={{
                      opacity: isCompleted || isSyncing ? 1 : 0.5,
                      animation: isCompleted ? `slideInSync 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` : 'none',
                    }}
                  >
                    {/* Status Icon - Morph Animation */}
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {isCompleted ? (
                        <svg
                          className="w-6 h-6 text-emerald-400"
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
                            className="animate-check-morph"
                          />
                        </svg>
                      ) : isCurrent && isSyncing ? (
                        <div
                          className="w-2 h-2 rounded-full bg-purple-400"
                          style={{
                            animation: 'dot-pulse 1.2s ease-in-out infinite'
                          }}
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-600/40" aria-hidden="true" />
                      )}
                    </div>

                    {/* Item Label */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-base" aria-hidden="true">{item.icon}</span>
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isCompleted ? 'text-emerald-300' : 'text-gray-200'
                      )}>
                        {item.label}
                      </p>
                    </div>

                    {/* Completion Badge */}
                    {isCompleted && (
                      <span className="text-xs font-bold text-emerald-400" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Final Summary - Appears after success */}
            {showSuccessContent && isSuccess && (
              <div className="space-y-4 pt-4 border-t border-purple-500/10 animate-fade-in">
                <div className="space-y-2">
                  {syncItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-400 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12L10 17L19 8"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm text-gray-200">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Timestamp */}
                {lastSyncTime && (
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-purple-500/10">
                    <Clock className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <p className="text-xs text-gray-400">
                      Last synced: {formatSyncTime(lastSyncTime)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Primary CTA Button */}
          {isSuccess && !isSyncing && (
            <div className="px-6 py-6 border-t border-purple-500/10">
              <Button
                onClick={onClose}
                className={cn(
                  'w-full h-14 font-heading font-bold text-base',
                  'rounded-lg transition-all duration-200',
                  'relative overflow-hidden group',
                  'hover:scale-[1.01] active:scale-[0.99]',
                  'flex items-center justify-center gap-2',
                  'shadow-lg hover:shadow-xl'
                )}
                style={{
                  background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(34, 211, 238) 100%)',
                  boxShadow: '0 0 25px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="relative z-10">
                  Awesome! Continue Learning
                </span>
                <BookOpen className="w-5 h-5 relative z-10" />
              </Button>
            </div>
          )}

          {/* Syncing State Button */}
          {isSyncing && (
            <div className="px-6 py-6 border-t border-purple-500/10">
              <Button
                disabled
                className="w-full h-14"
              >
                {t('sync.syncing')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-pop {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInSync {
          from {
            opacity: 0;
            transform: translateX(-16px);
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

        @keyframes sync-progress {
          0% {
            stroke-dashoffset: 282.6;
          }
          100% {
            stroke-dashoffset: -282.6;
          }
        }

        @keyframes sync-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-modal-pop {
          animation: modal-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-success-ring {
          animation: success-ring 0.8s ease-out forwards;
        }

        .animate-success-check {
          animation: success-check 0.8s ease-out forwards;
          animation-delay: 0.3s;
        }

        .animate-check-morph {
          animation: check-morph 0.35s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .animate-sync-progress {
          animation: sync-progress 2s linear infinite;
        }

        .animate-sync-spin {
          animation: sync-spin 1.2s linear infinite;
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
