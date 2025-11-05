import { z } from "zod";

// Esquema de validação para registro de usuário
export const userRegistrationSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Formato de email inválido"),
  // A validação de senha será feita no controller, após o hash
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
  // Outros campos opcionais
});

// Esquema de validação para criação de evento
export const eventCreationSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  location: z.string().min(5, "Localização deve ser especificada"),
  category: z.string().min(1, "Categoria é obrigatória"),
  imageUrl: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
});

// Função genérica para validar
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return res.status(400).json({
        error: "Erro de validação",
        details: errors,
      });
    }
    next(error);
  }
};

