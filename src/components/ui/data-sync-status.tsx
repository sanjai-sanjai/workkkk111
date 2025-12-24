import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
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

  // Load last sync time from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('last_sync_time');
    const savedStatus = localStorage.getItem('sync_status') as SyncStatus | null;
    if (saved) {
      setLastSyncTime(saved);
    }
    if (savedStatus) {
      setSyncStatus(savedStatus);
    }
  }, []);

  // Check internet connectivity
  const isOnline = useCallback((): boolean => {
    return navigator.onLine;
  }, []);

  // Handle button shake animation
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
      // Step 1: User Progress
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

      // Show green state for 4 seconds then close modal
      setTimeout(() => {
        setShowModal(false);
        setSyncStatus('unsynced');
        localStorage.setItem('sync_status', 'unsynced');
      }, 4000);
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
      }, 3000);
    }
  }, [isOnline, shakeButton, syncItems, t, toast]);

  const handleSyncClick = useCallback(() => {
    performSync();
  }, [performSync]);

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

  const getButtonColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-green-500 hover:bg-green-500/10';
      case 'syncing':
        return 'text-blue-500 hover:bg-blue-500/10';
      case 'error':
        return 'text-red-500 hover:bg-red-500/10';
      default: // unsynced
        return 'text-red-500 hover:bg-red-500/10';
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

  const displayText = () => {
    switch (syncStatus) {
      case 'synced':
        return t('sync.upToDate');
      case 'syncing':
        return t('sync.syncing');
      case 'error':
        return t('sync.syncFailed');
      default:
        return lastSyncTime ? `${t('sync.lastSynced')}: ${formatSyncTime(lastSyncTime)}` : t('sync.readyToSync');
    }
  };

  return (
    <>
      <button
        onClick={handleSyncClick}
        disabled={syncStatus === 'syncing'}
        aria-label="Sync data"
        title={syncStatus === 'unsynced' ? t('sync.tooltip') : syncStatus === 'synced' ? t('sync.allDataSynced') : ''}
        className={cn(
          'inline-flex items-center gap-1.5',
          'px-2 sm:px-3',
          'h-10 rounded-lg',
          'text-xs sm:text-sm font-medium',
          'transition-all duration-200',
          'disabled:opacity-70',
          getButtonColor(),
          className
        )}
      >
        <RefreshCw
          className={cn(
            'h-4 w-4 flex-shrink-0',
            syncStatus === 'syncing' && 'animate-spin',
            getIconColor()
          )}
        />
        <span className={cn(
          'hidden sm:inline whitespace-nowrap',
          getIconColor()
        )}>
          {displayText()}
        </span>
      </button>

      {/* Sync Popup Modal */}
      <SyncPopupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isSyncing={syncStatus === 'syncing'}
        isSuccess={syncStatus === 'synced'}
        lastSyncTime={lastSyncTime}
        syncItems={syncItems}
      />
    </>
  );
}
