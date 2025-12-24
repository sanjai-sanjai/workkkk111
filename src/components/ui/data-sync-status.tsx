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
    { id: '1', label: t('sync.userProgress') || 'Learning Progress', icon: '📚', completed: false, failed: false },
    { id: '2', label: t('sync.leaderboard') || 'Leaderboard', icon: '🏆', completed: false, failed: false },
    { id: '3', label: t('sync.ecoCoins') || 'EduCoins Wallet', icon: '🪙', completed: false, failed: false },
    { id: '4', label: t('sync.subjectProgress') || 'Subject Progress', icon: '📘', completed: false, failed: false },
    { id: '5', label: t('sync.tasksVerification') || 'Tasks & Verifications', icon: '✅', completed: false, failed: false },
  ]);

  const isSyncingRef = useRef(false);
  const syncStartTimeRef = useRef<number | null>(null);

  // Initialize on mount
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

  // Update sync items with translations
  useEffect(() => {
    setSyncItems([
      { id: '1', label: t('sync.userProgress') || 'Learning Progress', icon: '📚', completed: false, failed: false },
      { id: '2', label: t('sync.leaderboard') || 'Leaderboard', icon: '🏆', completed: false, failed: false },
      { id: '3', label: t('sync.ecoCoins') || 'EduCoins Wallet', icon: '🪙', completed: false, failed: false },
      { id: '4', label: t('sync.subjectProgress') || 'Subject Progress', icon: '📘', completed: false, failed: false },
      { id: '5', label: t('sync.tasksVerification') || 'Tasks & Verifications', icon: '✅', completed: false, failed: false },
    ]);
  }, [t]);

  // Check internet connectivity
  const isOnline = useCallback((): boolean => {
    return navigator.onLine;
  }, []);

  // Simulate sync operations sequentially
  const performSync = useCallback(async () => {
    // Check internet first
    if (!isOnline()) {
      toast({
        title: 'No Internet Connection',
        description: 'Try again when connection is available.',
        variant: 'destructive',
      });
      return;
    }

    // Prevent double-tap
    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');
    setShowModal(true);
    syncStartTimeRef.current = Date.now();

    // Reset sync items
    const newSyncItems = syncItems.map(item => ({
      ...item,
      completed: false,
      failed: false,
    }));
    setSyncItems(newSyncItems);

    try {
      // Sync total duration: ~5 seconds (0.8s per item × 5 items + margins)
      const SYNC_DURATION = 5000; // 5 seconds total
      const ITEM_DURATION = 800; // 0.8 seconds per item

      // Stagger item completion
      for (let i = 0; i < syncItems.length; i++) {
        await new Promise(resolve => setTimeout(resolve, ITEM_DURATION));
        
        setSyncItems(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], completed: true };
          return updated;
        });
      }

      // Final completion
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now);
      localStorage.setItem('sync_status', 'synced');
      setSyncStatus('synced');

      // Keep modal open - user must click button to close
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      setTimeout(() => {
        setShowModal(false);
        isSyncingRef.current = false;
      }, 3000);
    } finally {
      isSyncingRef.current = false;
      syncStartTimeRef.current = null;
    }
  }, [isOnline, syncItems, toast]);

  const handleSyncClick = useCallback(() => {
    if (!isSyncingRef.current) {
      performSync();
    }
  }, [performSync]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  // Get button styling based on sync status
  const getButtonClasses = () => {
    switch (syncStatus) {
      case 'synced':
        return 'text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/50';
      case 'syncing':
        return 'text-purple-400 hover:bg-purple-500/15 border border-purple-500/30 hover:border-purple-500/50';
      case 'error':
        return 'text-red-500 hover:bg-red-500/15 border border-red-500/30 hover:border-red-500/50';
      default: // unsynced
        return 'text-red-500 hover:bg-red-500/15 border border-red-500/30 hover:border-red-500/50 animate-subtle-pulse';
    }
  };

  const getTooltipText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'All data synced successfully';
      case 'syncing':
        return 'Syncing your data...';
      case 'error':
        return 'Sync failed. Try again.';
      default:
        return 'Data not synced. Tap to sync.';
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
          'inline-flex items-center justify-center',
          'w-10 h-10 rounded-lg',
          'transition-all duration-200',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'active:scale-95',
          getButtonClasses(),
          className
        )}
      >
        {/* Circular Sync Icon */}
        <svg
          className={cn(
            'w-5 h-5 flex-shrink-0',
            isSyncing && 'animate-sync-rotate'
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Circular arrows icon */}
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2-8.83" />
        </svg>
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
        @keyframes sync-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes subtle-pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            opacity: 0.9;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }
        }

        .animate-sync-rotate {
          animation: sync-rotate 5s linear infinite;
        }

        .animate-subtle-pulse {
          animation: subtle-pulse 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
