import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Cloud } from 'lucide-react';
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

  // Handle button shake animation for offline state
  const shakeButton = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    element.classList.add('animate-shake');
    setTimeout(() => {
      element.classList.remove('animate-shake');
    }, 500);
  }, []);

  // Simulate sync operations sequentially
  const performSync = useCallback(async () => {
    if (!isOnline()) {
      const button = document.querySelector('[aria-label="Sync data"]');
      shakeButton(button as HTMLElement);
      toast({
        title: t('sync.noInternet'),
        description: t('sync.noInternetMessage'),
        variant: 'destructive',
      });
      return;
    }

    if (isSyncingRef.current) {
      return; // Prevent double-taps
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

    // Simulate sequential sync operations
    try {
      // Step 1: User Progress (400ms interval as per spec)
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncItems(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], completed: true };
        return updated;
      });

      // Step 2: Leaderboard Data
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncItems(prev => {
        const updated = [...prev];
        updated[1] = { ...updated[1], completed: true };
        return updated;
      });

      // Step 3: EduCoins Wallet
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncItems(prev => {
        const updated = [...prev];
        updated[2] = { ...updated[2], completed: true };
        return updated;
      });

      // Step 4: Subject Learning Progress
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncItems(prev => {
        const updated = [...prev];
        updated[3] = { ...updated[3], completed: true };
        return updated;
      });

      // Step 5: Tasks & Verifications
      await new Promise(resolve => setTimeout(resolve, 800));
      setSyncItems(prev => {
        const updated = [...prev];
        updated[4] = { ...updated[4], completed: true };
        return updated;
      });

      // All completed successfully
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now);
      localStorage.setItem('sync_status', 'synced');
      setSyncStatus('synced');

      // Modal stays open - user must click the button to close
      // Sound will play automatically in the modal when success state is reached
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
      // Only reset the syncing flag, don't close modal - user must click button
      isSyncingRef.current = false;
    }
  }, [isOnline, shakeButton, syncItems, t, toast]);

  const handleSyncClick = useCallback(() => {
    performSync();
  }, [performSync]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const formatSyncTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins === 0) return t('sync.justNow');
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (date.toDateString() === now.toDateString()) {
        return `Today, ${timeStr}`;
      }

      const dateStr = date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr}, ${timeStr}`;
    } catch {
      return t('sync.unknown');
    }
  };

  const getButtonClasses = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-500 hover:bg-green-500/10 hover:border-green-500/30';
      case 'syncing':
        return 'text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30';
      case 'error':
        return 'text-red-500 hover:bg-red-500/10 hover:border-red-500/30';
      default: // unsynced
        return 'text-red-500 hover:bg-red-500/10 hover:border-red-500/30';
    }
  };

  const getIconColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-500';
      case 'syncing':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default: // unsynced
        return 'text-red-500';
    }
  };

  const getTooltipText = () => {
    switch (syncStatus) {
      case 'synced':
        return t('sync.allDataSynced');
      case 'syncing':
        return t('sync.syncing');
      case 'error':
        return t('sync.syncFailed');
      default:
        return t('sync.tooltip');
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
        return lastSyncTime ? `${t('sync.lastSynced')}: ${formatSyncTime(lastSyncTime)}` : t('sync.readyToSync');
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
          'border border-transparent transition-all duration-200',
          'text-xs sm:text-sm font-medium',
          'disabled:opacity-70 disabled:cursor-not-allowed',
          'hover:opacity-80 active:scale-95 transition-transform',
          getButtonClasses(),
          className
        )}
      >
        {syncStatus === 'synced' ? (
          <Cloud className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        ) : (
          <RefreshCw
            className={cn(
              'h-5 w-5 flex-shrink-0',
              syncStatus === 'syncing' && 'animate-spin-smooth',
              getIconColor()
            )}
            aria-hidden="true"
          />
        )}
        <span className={cn(
          'hidden sm:inline whitespace-nowrap font-semibold',
          getIconColor()
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

        @keyframes spin-smooth {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-spin-smooth {
          animation: spin-smooth 1.5s linear infinite;
        }
      `}</style>
    </>
  );
}
