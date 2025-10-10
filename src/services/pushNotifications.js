// Serviço de Push Notifications
// Utiliza a API de Notifications do navegador para enviar notificações push

class PushNotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  // Verificar permissão atual
  checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  // Solicitar permissão para enviar notificações
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }

  // Enviar notificação push
  async sendNotification(title, options = {}) {
    // Verificar se tem permissão
    if (this.permission !== 'granted') {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn('Permissão de notificação negada');
        return null;
      }
    }

    // Opções padrão
    const defaultOptions = {
      icon: '/logo.png',
      badge: '/badge.png',
      vibrate: [200, 100, 200],
      tag: 'default',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Eventos da notificação
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.onClick) {
          options.onClick(notification);
        }
        notification.close();
      };

      notification.onclose = () => {
        if (options.onClose) {
          options.onClose(notification);
        }
      };

      notification.onerror = (error) => {
        console.error('Erro na notificação:', error);
        if (options.onError) {
          options.onError(error);
        }
      };

      return notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  // Enviar notificação de novo evento
  async notifyNewEvent(evento) {
    return await this.sendNotification('Novo Evento Próximo', {
      body: evento.titulo,
      icon: evento.imagem || '/logo.png',
      tag: `evento-${evento.id}`,
      data: { type: 'evento', id: evento.id },
      onClick: () => {
        window.location.href = `/eventos/${evento.id}`;
      }
    });
  }

  // Enviar notificação de atualização de reclamação
  async notifyReclamacaoUpdate(reclamacao) {
    return await this.sendNotification('Atualização de Reclamação', {
      body: `Sua reclamação foi atualizada para: ${reclamacao.status}`,
      icon: '/logo.png',
      tag: `reclamacao-${reclamacao.id}`,
      data: { type: 'reclamacao', id: reclamacao.id },
      onClick: () => {
        window.location.href = `/reclamacoes/${reclamacao.id}`;
      }
    });
  }

  // Enviar notificação de lembrete de evento
  async notifyEventReminder(evento, tempoAntes) {
    const tempo = tempoAntes === 1 ? '1 hora' : `${tempoAntes} horas`;
    return await this.sendNotification('Lembrete de Evento', {
      body: `${evento.titulo} começa em ${tempo}`,
      icon: evento.imagem || '/logo.png',
      tag: `lembrete-${evento.id}`,
      requireInteraction: true,
      data: { type: 'lembrete', id: evento.id },
      onClick: () => {
        window.location.href = `/eventos/${evento.id}`;
      }
    });
  }

  // Enviar notificação customizada
  async notifyCustom(titulo, mensagem, options = {}) {
    return await this.sendNotification(titulo, {
      body: mensagem,
      ...options
    });
  }

  // Verificar se o navegador suporta notificações
  isSupported() {
    return 'Notification' in window;
  }

  // Obter status da permissão
  getPermissionStatus() {
    return this.permission;
  }

  // Simular recebimento de notificações em tempo real
  startSimulation(callback) {
    if (!this.isSupported() || this.permission !== 'granted') {
      console.warn('Notificações não estão disponíveis ou não foram autorizadas');
      return null;
    }

    // Simular notificações a cada 60 segundos
    const interval = setInterval(() => {
      const tipos = ['evento', 'reclamacao', 'sistema'];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];

      let titulo, mensagem;
      
      switch (tipo) {
        case 'evento':
          titulo = 'Novo Evento Próximo';
          mensagem = 'Um novo evento foi adicionado na sua região';
          break;
        case 'reclamacao':
          titulo = 'Atualização de Reclamação';
          mensagem = 'Uma de suas reclamações foi atualizada';
          break;
        case 'sistema':
          titulo = 'Notificação do Sistema';
          mensagem = 'Você tem novas atualizações disponíveis';
          break;
      }

      this.sendNotification(titulo, {
        body: mensagem,
        tag: `simulacao-${Date.now()}`,
        onClick: () => {
          if (callback) callback({ tipo, titulo, mensagem });
        }
      });
    }, 60000); // 60 segundos

    return interval;
  }

  // Parar simulação
  stopSimulation(interval) {
    if (interval) {
      clearInterval(interval);
    }
  }
}

// Criar instância única do serviço
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;

// Exportar funções individuais para facilitar o uso
export const {
  requestPermission,
  sendNotification,
  notifyNewEvent,
  notifyReclamacaoUpdate,
  notifyEventReminder,
  notifyCustom,
  isSupported,
  getPermissionStatus,
  startSimulation,
  stopSimulation
} = pushNotificationService;

