// Serviço de Cache Offline
// Utiliza IndexedDB para armazenar dados localmente e permitir funcionamento offline

class OfflineCacheService {
  constructor() {
    this.dbName = 'MapaRealidadeDB';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    
    this.init();
    this.setupOnlineListeners();
  }

  // Inicializar IndexedDB
  async init() {
    try {
      this.db = await this.openDatabase();
    } catch (error) {
      console.error('Erro ao inicializar IndexedDB:', error);
    }
  }

  // Abrir banco de dados
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Criar object stores
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('categoria', 'categoria', { unique: false });
          eventsStore.createIndex('dataInicio', 'dataInicio', { unique: false });
        }

        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Configurar listeners de status online/offline
  setupOnlineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });
  }

  // Notificar mudança de status online/offline
  notifyOnlineStatus(isOnline) {
    const event = new CustomEvent('onlineStatusChange', { detail: { isOnline } });
    window.dispatchEvent(event);
  }

  // Salvar dados no cache
  async set(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter dados do cache
  async get(storeName, key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Obter todos os dados de uma store
  async getAll(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Deletar dados do cache
  async delete(storeName, key) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Limpar todos os dados de uma store
  async clear(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Salvar eventos no cache
  async cacheEvents(events) {
    try {
      const promises = events.map(event => this.set('events', event));
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Erro ao cachear eventos:', error);
      return { success: false, error };
    }
  }

  // Obter eventos do cache
  async getCachedEvents() {
    try {
      const events = await this.getAll('events');
      return { success: true, data: events };
    } catch (error) {
      console.error('Erro ao obter eventos do cache:', error);
      return { success: false, data: [], error };
    }
  }

  // Adicionar ação pendente (para sincronizar quando voltar online)
  async addPendingAction(action) {
    try {
      const actionData = {
        ...action,
        timestamp: new Date().toISOString(),
        synced: false
      };
      await this.set('pendingActions', actionData);
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar ação pendente:', error);
      return { success: false, error };
    }
  }

  // Sincronizar ações pendentes quando voltar online
  async syncPendingActions() {
    try {
      const pendingActions = await this.getAll('pendingActions');
      
      if (pendingActions.length === 0) {
        return { success: true, synced: 0 };
      }

      let syncedCount = 0;

      for (const action of pendingActions) {
        try {
          // Executar a ação (fazer requisição à API)
          // Aqui você implementaria a lógica específica para cada tipo de ação
          console.log('Sincronizando ação:', action);
          
          // Marcar como sincronizada
          await this.delete('pendingActions', action.id);
          syncedCount++;
        } catch (error) {
          console.error('Erro ao sincronizar ação:', error);
        }
      }

      return { success: true, synced: syncedCount };
    } catch (error) {
      console.error('Erro ao sincronizar ações pendentes:', error);
      return { success: false, error };
    }
  }

  // Verificar se está online
  checkOnlineStatus() {
    return this.isOnline;
  }

  // Obter estatísticas do cache
  async getCacheStats() {
    try {
      const events = await this.getAll('events');
      const notifications = await this.getAll('notifications');
      const pendingActions = await this.getAll('pendingActions');

      return {
        success: true,
        stats: {
          events: events.length,
          notifications: notifications.length,
          pendingActions: pendingActions.length,
          isOnline: this.isOnline
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
      return { success: false, error };
    }
  }

  // Limpar todo o cache
  async clearAllCache() {
    try {
      await this.clear('events');
      await this.clear('notifications');
      await this.clear('userPreferences');
      // Não limpar pendingActions para não perder dados não sincronizados
      return { success: true };
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return { success: false, error };
    }
  }
}

// Criar instância única do serviço
const offlineCacheService = new OfflineCacheService();

export default offlineCacheService;

// Exportar funções individuais
export const {
  set,
  get,
  getAll,
  delete: deleteCache,
  clear,
  cacheEvents,
  getCachedEvents,
  addPendingAction,
  syncPendingActions,
  checkOnlineStatus,
  getCacheStats,
  clearAllCache
} = offlineCacheService;

