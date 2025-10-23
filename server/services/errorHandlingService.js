// Middleware de tratamento de erros centralizado
export const errorHandler = (err, req, res, next) => {
  console.error("Erro não tratado:", err);

  // Erro de validação do Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Erro de validação",
      details: err.errors,
    });
  }

  // Erro de autenticação
  if (err.status === 401) {
    return res.status(401).json({
      error: "Não autenticado",
      message: err.message,
    });
  }

  // Erro de autorização
  if (err.status === 403) {
    return res.status(403).json({
      error: "Sem permissão",
      message: err.message,
    });
  }

  // Erro de não encontrado
  if (err.status === 404) {
    return res.status(404).json({
      error: "Recurso não encontrado",
      message: err.message,
    });
  }

  // Erro de conflito (ex: email já existe)
  if (err.status === 409) {
    return res.status(409).json({
      error: "Conflito",
      message: err.message,
    });
  }

  // Erro padrão do servidor
  res.status(err.status || 500).json({
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === "development" ? err.message : "Algo deu errado",
  });
};

// Classe de erro customizada
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

