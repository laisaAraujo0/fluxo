const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class UserService {
  // Registrar novo usuário
  async register(userData) {
    try {
      console.log('🚀 UserService: Iniciando registro com dados:', userData);
      
      const payload = {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        username: userData.email.split('@')[0], // Gerar username do email
        cidade: userData.cidade,
        estado: userData.estado,
        telefone: userData.telefone,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.nome)}&background=random`,
        status: 'ACTIVE'
      };
      
      console.log('📡 UserService: Enviando para API:', `${API_BASE_URL}/usuarios/registrar`);
      console.log('📦 UserService: Payload:', payload);

      const response = await fetch(`${API_BASE_URL}/usuarios/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📨 UserService: Status da resposta:', response.status);
      console.log('📨 UserService: Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ UserService: Erro na resposta:', error);
        throw new Error(error.erro || 'Erro ao registrar usuário');
      }

      const data = await response.json();
      console.log('✅ UserService: Registro bem-sucedido:', data);
      return data;
    } catch (error) {
      console.error('❌ UserService: Erro ao registrar usuário:', error);
      throw error;
    }
  }

  // Login de usuário
  async login(email, senha) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao fazer login');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  // Validar dados do formulário
  validateFormData(formData) {
    const errors = {};

    if (!formData.nome || formData.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.senha || formData.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem';
    }

    if (!formData.cidade || formData.cidade.trim().length < 2) {
      errors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.estado || formData.estado.trim().length < 2) {
      errors.estado = 'Estado é obrigatório';
    }

    if (!formData.telefone || formData.telefone.trim().length < 10) {
      errors.telefone = 'Telefone é obrigatório';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

}

export default new UserService();