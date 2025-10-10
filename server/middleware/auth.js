import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fluxo-secret-key-2024';

// Middleware para verificar token JWT
export const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar se é admin
export const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin' && req.usuario.tipo !== 'orgao') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

// Middleware opcional de autenticação (não bloqueia se não houver token)
export const autenticacaoOpcional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.usuario = decoded;
    }
    next();
  } catch (error) {
    // Ignora erros e continua sem autenticação
    next();
  }
};

