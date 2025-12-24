import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useToast } from './use-toast';
import { SyncPopupModal } from './sync-popup-modal';

interface SyncItem {
  id: string;
  label: string;
  icon: string;
  completed: boolean;
  failed: boolean;
}

interface DataSyncStatusProps {
  className?: string;
}

type SyncStatus = 'unsynced' | 'syncing' | 'synced' | 'error';

export function DataSyncStatus({ className }: DataSyncStatusProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('unsynced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [syncItems, setSyncItems] = useState<SyncItem[]>([
    { id: '1', label: t('sync.userProgress'), icon: '📚', completed: false, failed: false },
    { id: '2', label: t('sync.leaderboard'), icon: '🏆', completed: false, failed: false },
    { id: '3', label: t('sync.ecoCoins'), icon: '🪙', completed: false, failed: false },
    { id: '4', label: t('sync.subjectProgress'), icon: '📖', completed: false, failed: false },
    { id: '5', label: t('sync.tasksVerification'), icon: '✅', completed: false, failed: false },
  ]);

  const isSyncingRef = useRef(false);

  // Load last sync time from localStorage and initialize sync items with translations
  useEffect(() => {
    const saved = localStorage.getItem('last_sync_time');
    const savedStatus = localStorage.getItem('sync_status') as SyncStatus | null;
    if (saved) {
      setLastSyncTime(saved);
    }
    if (savedStatus) {
      setSyncStatus(savedStatus);
    }

    // Update sync items with translations
    setSyncItems([
      { id: '1', label: t('sync.userProgress'), icon: '📚', completed: false, failed: false },
      { id: '2', label: t('sync.leaderboard'), icon: '🏆', completed: false, failed: false },
      { id: '3', label: t('sync.ecoCoins'), icon: '🪙', completed: false, failed: false },
      { id: '4', label: t('sync.subjectProgress'), icon: '📖', completed: false, failed: false },
      { id: '5', label: t('sync.tasksVerification'), icon: '✅', completed: false, failed: false },
    ]);
  }, [t]);

  // Check internet connectivity
  const isOnline = useCallback((): boolean => {
    return navigator.onLine;
  }, []);

  // Simulate sync operations sequentially
  const performSync = useCallback(async () => {
    if (!isOnline()) {
      const button = document.querySelector('[aria-label="Sync data"]');
      if (button) {
        button.classList.add('animate-shake');
        setTimeout(() => {
          button.classList.remove('animate-shake');
        }, 500);
      }
      toast({
        title: t('sync.noInternet'),
        description: t('sync.noInternetMessage'),
        variant: 'destructive',
      });
      return;
    }

    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');
    setShowModal(true);

    // Reset sync items
    const newSyncItems = syncItems.map(item => ({
      ...item,
      completed: false,
      failed: false,
    }));
    setSyncItems(newSyncItems);

    try {
      // Simulate sequential sync operations (400ms interval)
      await new Promise(resolve => setTimeout(resolve, 400));

      // All operations complete
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now);
      localStorage.setItem('sync_status', 'synced');
      setSyncStatus('synced');

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      toast({
        title: t('sync.syncFailed'),
        description: t('sync.syncFailedMessage'),
        variant: 'destructive',
      });
      setTimeout(() => {
        setShowModal(false);
        isSyncingRef.current = false;
      }, 3000);
    } finally {
      isSyncingRef.current = false;
    }
  }, [isOnline, syncItems, t, toast]);

  const handleSyncClick = useCallback(() => {
    performSync();
  }, [performSync]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  // Get button styling based on sync status
  const getButtonClasses = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/50';
      case 'syncing':
        return 'text-purple-400 hover:bg-purple-500/15 border border-purple-500/30 hover:border-purple-500/50';
      case 'error':
        return 'text-red-400 hover:bg-red-500/15 border border-red-500/30 hover:border-red-500/50';
      default: // unsynced
        return 'text-red-500 hover:bg-red-500/15 border border-red-500/30 hover:border-red-500/50 animate-pulse-subtle';
    }
  };

  const getTooltipText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'All data synced';
      case 'syncing':
        return t('sync.syncing');
      case 'error':
        return t('sync.syncFailed');
      default:
        return 'Data not synced';
    }
  };

  const displayText = () => {
    switch (syncStatus) {
      case 'synced':
        return '✓ Synced';
      case 'syncing':
        return t('sync.syncing');
      case 'error':
        return t('sync.syncFailed');
      default:
        return 'Sync Data';
    }
  };

  const isSyncing = syncStatus === 'syncing';

  return (
    <>
      <button
        onClick={handleSyncClick}
        disabled={isSyncing}
        aria-label="Sync data"
        title={getTooltipText()}
        className={cn(
          'inline-flex items-center gap-2',
          'px-3 sm:px-4',
          'h-10 rounded-lg',
          'transition-all duration-200',
          'text-xs sm:text-sm font-semibold',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'active:scale-95',
          getButtonClasses(),
          className
        )}
      >
        {/* Circular Sync Icon - Curved Arrows */}
        <svg
          className={cn(
            'w-5 h-5 flex-shrink-0',
            syncStatus === 'syncing' && 'animate-sync-rotate-slow'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Top right curved arrow */}
          <path d="M21.5 2.5L21.5 9m0 0h-6.5m6.5 0c-2.76-2.76-7.24-2.76-10 0s-2.76 7.24 0 10" />
          {/* Bottom left curved arrow */}
          <path d="M2.5 21.5h6.5m0 0v-6.5m0 6.5c2.76 2.76 7.24 2.76 10 0s2.76-7.24 0-10" />
        </svg>

        {/* Status Badge for Success */}
        {syncStatus === 'synced' && (
          <svg
            className="w-3 h-3 text-emerald-400"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8L6 11L13 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        <span className={cn(
          'hidden sm:inline whitespace-nowrap'
        )}>
          {displayText()}
        </span>
      </button>

      {/* Sync Popup Modal */}
      <SyncPopupModal
        isOpen={showModal}
        onClose={handleModalClose}
        isSyncing={isSyncing}
        isSuccess={syncStatus === 'synced'}
        lastSyncTime={lastSyncTime}
        syncItems={syncItems}
      />

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        @keyframes sync-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
          50% {
            opacity: 0.8;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-sync-rotate-slow {
          animation: sync-rotate 5s linear infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
