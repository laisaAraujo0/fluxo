// Serviço de Cache Offline
// Utiliza IndexedDB para armazenar dados localmente e permitir funcionamento offline

class OfflineCacheService {
  constructor() {
    this.dbName = 'MapaRealidadeDB';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;

    this.setupOnlineListeners();
  }

  async initialize() {
    try {
      this.db = await this.openDatabase();
    } catch (error) {
      console.error('Erro ao inicializar IndexedDB:', error);
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

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

  setupOnlineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Conectado à internet.');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Sem conexão com a internet.');
    });
  }
}

export default OfflineCacheService;

// Exemplo de uso:
// const cacheService = new OfflineCacheService();
// cacheService.initialize();
