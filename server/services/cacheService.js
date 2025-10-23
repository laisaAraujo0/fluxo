import NodeCache from "node-cache";

// Cache com TTL (Time To Live) padrão de 60 segundos
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Middleware de cache para rotas GET
export const cacheMiddleware = (duration) => (req, res, next) => {
  // Apenas cachear rotas GET
  if (req.method !== "GET") {
    return next();
  }

  // Criar chave de cache baseada na URL
  const key = req.originalUrl || req.url;
  const cachedBody = cache.get(key);

  if (cachedBody) {
    console.log(`[Cache] HIT: ${key}`);
    // Se o cache existir, retorna a resposta imediatamente
    res.send(cachedBody);
    return;
  }

  // Se não houver cache, substitui o método .send para interceptar a resposta
  console.log(`[Cache] MISS: ${key}`);
  res.sendResponse = res.send;
  res.send = (body) => {
    cache.set(key, body, duration);
    res.sendResponse(body);
  };
  next();
};

// Função para invalidar um cache específico (ex: após a criação/atualização de um evento)
export const invalidateCache = (key) => {
  const result = cache.del(key);
  console.log(`[Cache] Invalidated cache for key: ${key}. Result: ${result}`);
  return result;
};

// Função para invalidar todos os caches que começam com um prefixo
export const invalidateCacheByPrefix = (prefix) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.startsWith(prefix));
  if (keysToDelete.length > 0) {
    const result = cache.del(keysToDelete);
    console.log(`[Cache] Invalidated ${keysToDelete.length} keys with prefix: ${prefix}. Result: ${result}`);
    return result;
  }
  return 0;
};

// Exportar a instância do cache para uso direto se necessário (ex: para invalidar)
export default cache;

