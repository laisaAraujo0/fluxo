import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import offlineCacheService from '@/services/offlineCache';
import { toast } from 'sonner';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnlineStatusChange = (event) => {
      setIsOnline(event.detail.isOnline);
      
      if (event.detail.isOnline) {
        toast.success('Conexão restabelecida');
        loadCacheStats();
      } else {
        toast.info('Você está offline');
      }
    };

    window.addEventListener('onlineStatusChange', handleOnlineStatusChange);
    loadCacheStats();

    return () => {
      window.removeEventListener('onlineStatusChange', handleOnlineStatusChange);
    };
  }, []);

  const loadCacheStats = async () => {
    const stats = await offlineCacheService.getCacheStats();
    if (stats.success) {
      setCacheStats(stats.stats);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    
    try {
      const result = await offlineCacheService.syncPendingActions();
      
      if (result.success) {
        toast.success(`${result.synced} ações sincronizadas`);
        loadCacheStats();
      } else {
        toast.error('Erro ao sincronizar dados');
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar dados');
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && (!cacheStats || cacheStats.pendingActions === 0)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {!isOnline && (
        <Alert className="bg-orange-500/10 border-orange-500/20">
          <WifiOff className="h-4 w-4 text-orange-500" />
          <AlertDescription>
            <p className="font-medium text-orange-500">Modo Offline</p>
            <p className="text-sm text-muted-foreground">
              Você está trabalhando offline
            </p>
          </AlertDescription>
        </Alert>
      )}

      {isOnline && cacheStats && cacheStats.pendingActions > 0 && (
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Wifi className="h-4 w-4 text-blue-500" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-blue-500">Sincronização Disponível</p>
              <p className="text-sm text-muted-foreground">
                {cacheStats.pendingActions} ações pendentes
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const OfflineBadge = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnlineStatusChange = (event) => {
      setIsOnline(event.detail.isOnline);
    };

    window.addEventListener('onlineStatusChange', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('onlineStatusChange', handleOnlineStatusChange);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      Offline
    </Badge>
  );
};

export default OfflineIndicator;

