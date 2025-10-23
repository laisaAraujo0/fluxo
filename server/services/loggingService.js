import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Arquivo de log
const logFile = path.join(logsDir, `app-${new Date().toISOString().split("T")[0]}.log`);

// Função para formatar logs
const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...data,
  });
};

// Função para escrever logs
const writeLog = (level, message, data) => {
  const logEntry = formatLog(level, message, data);
  console.log(logEntry);

  // Escrever no arquivo de log
  fs.appendFileSync(logFile, logEntry + "\n", (err) => {
    if (err) console.error("Erro ao escrever log:", err);
  });
};

// Exportar funções de logging
export const logger = {
  info: (message, data) => writeLog("INFO", message, data),
  warn: (message, data) => writeLog("WARN", message, data),
  error: (message, data) => writeLog("ERROR", message, data),
  debug: (message, data) => writeLog("DEBUG", message, data),
};

// Middleware de logging para requisições
export const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Interceptar o método send para registrar a resposta
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    logger.info("HTTP Request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.usuario?.id || "anonymous",
    });
    originalSend.call(this, data);
  };

  next();
};

export default logger;

