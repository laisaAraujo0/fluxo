// Função para remover caracteres perigosos e XSS
export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  return str
    .replace(/[<>\"'&]/g, (char) => {
      const escapeMap = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return escapeMap[char];
    })
    .trim();
};

// Função para sanitizar objetos
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

// Middleware de sanitização
export const sanitizationMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

// Função para validar e sanitizar email
export const sanitizeEmail = (email) => {
  const sanitized = sanitizeString(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : null;
};

// Função para validar e sanitizar URL
export const sanitizeUrl = (url) => {
  try {
    const sanitized = sanitizeString(url);
    new URL(sanitized);
    return sanitized;
  } catch (error) {
    return null;
  }
};

