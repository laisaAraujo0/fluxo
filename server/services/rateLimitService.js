import NodeCache from "node-cache";

// Cache para armazenar o número de requisições por IP
const requestCounts = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Middleware de rate limiting
export const rateLimitMiddleware = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate-limit:${ip}`;

    // Obter o número de requisições atuais
    let count = requestCounts.get(key) || 0;

    if (count >= maxRequests) {
      return res.status(429).json({
        error: "Muitas requisições",
        message: "Você excedeu o limite de requisições. Tente novamente mais tarde.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Incrementar o contador
    count += 1;
    requestCounts.set(key, count, Math.ceil(windowMs / 1000));

    // Adicionar headers de rate limit
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - count);
    res.setHeader("X-RateLimit-Reset", new Date(Date.now() + windowMs).toISOString());

    next();
  };
};

// Rate limiting específico para login (mais restritivo)
export const loginRateLimitMiddleware = rateLimitMiddleware(5, 15 * 60 * 1000); // 5 tentativas a cada 15 minutos

// Rate limiting específico para criação de eventos (moderado)
export const eventCreationRateLimitMiddleware = rateLimitMiddleware(30, 60 * 60 * 1000); // 30 eventos por hora

// Rate limiting geral (permissivo)
export const generalRateLimitMiddleware = rateLimitMiddleware(200, 60 * 1000); // 200 requisições por minuto

export default rateLimitMiddleware;

