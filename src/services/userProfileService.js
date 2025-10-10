const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class UserProfileService {
  // Obter token do localStorage
  getAuthToken() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token;
  }

  // Headers padrão para requisições autenticadas
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obter perfil completo do usuário
  async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao obter perfil do usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  }

  // Atualizar perfil do usuário
  async updateUserProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/perfil`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil do usuário');
      }

      const result = await response.json();
      
      // Atualizar dados do usuário no localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        ...result.usuario
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return result;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  // Atualizar apenas informações básicas do perfil
  async updateBasicInfo(basicInfo) {
    const { nome, email, bio, cidade, estado, telefone } = basicInfo;
    
    return this.updateUserProfile({
      nome,
      email,
      bio,
      cidade,
      estado,
      telefone
    });
  }

  // Atualizar configurações de privacidade
  async updatePrivacySettings(privacySettings) {
    const {
      perfilPublico,
      mostrarEmail,
      mostrarCidade,
      mostrarTelefone
    } = privacySettings;

    return this.updateUserProfile({
      perfilPublico,
      mostrarEmail,
      mostrarCidade,
      mostrarTelefone
    });
  }

  // Atualizar configurações de notificação
  async updateNotificationSettings(notificationSettings) {
    const {
      notificacaoComentarios,
      notificacaoMencoes,
      notificacaoSeguidores
    } = notificationSettings;

    return this.updateUserProfile({
      notificacaoComentarios,
      notificacaoMencoes,
      notificacaoSeguidores
    });
  }

  // Atualizar avatar do usuário
  async updateAvatar(avatarUrl) {
    return this.updateUserProfile({
      avatar: avatarUrl
    });
  }

  // Obter perfil público de outro usuário
  async getPublicProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/perfil-publico`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao obter perfil público');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter perfil público:', error);
      throw error;
    }
  }

  // Validar dados do perfil
  validateProfileData(data) {
    const errors = {};

    if (!data.nome || data.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.email = 'Email inválido';
    }

    if (data.telefone && !this.isValidPhone(data.telefone)) {
      errors.telefone = 'Telefone inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar telefone
  isValidPhone(phone) {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  // Formatar telefone
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    
    return phone;
  }
}

export default new UserProfileService();
