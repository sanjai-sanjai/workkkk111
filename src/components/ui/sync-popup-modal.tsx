import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ConfettiEffect } from './confetti-effect';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Animate items one by one after success
  useEffect(() => {
    if (isSuccess && !isSyncing) {
      setShowConfetti(true);
      
      // Animate each item sequentially
      syncItems.forEach((item, index) => {
        const timer = setTimeout(() => {
          setCompletedItems(prev => [...prev, item.id]);
        }, index * 300);

        return () => clearTimeout(timer);
      });

      const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(confettiTimer);
    }
  }, [isSuccess, isSyncing, syncItems]);

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
        onClick={onClose}
      />

      {/* Centered Modal - Glassmorphic design */}
      <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'w-full max-w-md pointer-events-auto rounded-2xl',
            'backdrop-blur-2xl border border-purple-500/20',
            'shadow-2xl',
            'p-8 sm:p-10',
            'animate-pop',
            'flex flex-col gap-6'
          )}
          style={{
            background: 'linear-gradient(180deg, rgba(30,27,60,0.9) 0%, rgba(15,12,30,0.95) 100%)',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Success Icon */}
          {isSuccess && !hasFailedItems && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                {/* Animated ring */}
                <svg
                  className="absolute inset-0 w-16 h-16 transform -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.2)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="2"
                    strokeDasharray="175.93"
                    strokeDashoffset="175.93"
                    className="animate-success-ring"
                  />
                </svg>
                
                {/* Checkmark */}
                <svg
                  className="absolute inset-0 w-16 h-16"
                  viewBox="0 0 64 64"
                  fill="none"
                >
                  <path
                    d="M20 32L28 40L44 24"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="36"
                    strokeDashoffset="36"
                    className="animate-success-check"
                  />
                </svg>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-white mb-2">
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
                />
              </div>
              <h2 className="text-2xl font-heading font-bold text-white">
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
                    'px-4 py-3 rounded-full flex items-center gap-3 transition-all duration-500',
                    isCompleted ? 'bg-green-500/10' : isCurrent && isSyncing ? 'bg-purple-500/10' : 'bg-slate-700/30',
                  )}
                  style={{
                    opacity: isCompleted || isSyncing || isSyncing ? 1 : 0.5,
                    animation: isCompleted ? `slideInSync 0.4s ease-out forwards` : 'none',
                  }}
                >
                  {/* Icon - animated loader or checkmark */}
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-green-400 animate-success-check-small"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M5 10L8 13L15 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="16"
                          strokeDashoffset="0"
                        />
                      </svg>
                    ) : isCurrent && isSyncing ? (
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-500/50" />
                    )}
                  </div>

                  {/* Label and icon */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-sm">{item.icon}</span>
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isCompleted ? 'text-green-300' : 'text-gray-200'
                    )}>
                      {item.label}
                    </p>
                  </div>

                  {/* Status */}
                  {isCompleted && (
                    <span className="text-xs font-medium text-green-300">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Timestamp */}
          {isSuccess && lastSyncTime && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-purple-500/10">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-400">
                {t('sync.lastSynced')}: {formatSyncTime(lastSyncTime)}
              </p>
            </div>
          )}

          {/* Action Button */}
          {isSuccess && !hasFailedItems && (
            <Button
              onClick={onClose}
              className={cn(
                'w-full h-12 font-heading font-semibold text-base',
                'rounded-xl transition-all duration-300',
                'relative overflow-hidden',
                'animate-pulse-subtle'
              )}
              style={{
                background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(147, 51, 234) 100%)',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
              }}
            >
              <span className="relative z-10">
                {t('sync.continueButton')}
              </span>
            </Button>
          )}

          {isSyncing && (
            <Button
              disabled
              className="w-full h-12"
              size="lg"
            >
              {t('sync.syncing')}
            </Button>
          )}

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
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes success-ring {
          0% {
            stroke-dashoffset: 175.93;
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
            stroke-dashoffset: 36;
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
            stroke-dashoffset: 16;
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
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

        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
