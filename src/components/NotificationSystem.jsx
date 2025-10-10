import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simular notificações do sistema
    const systemNotifications = [
      {
        id: 1,
        type: 'info',
        title: 'Bem-vindo ao Mapa da Realidade!',
        message: 'Explore eventos e contribua para melhorar sua comunidade.',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'success',
        title: 'Sistema atualizado',
        message: 'Nova versão com melhorias de performance disponível.',
        timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        read: false
      },
      {
        id: 3,
        type: 'warning',
        title: 'Manutenção programada',
        message: 'Sistema ficará indisponível das 02:00 às 04:00 para manutenção.',
        timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
        read: true
      }
    ];

    setNotifications(systemNotifications);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    getIcon,
    formatTime
  };
};

export default NotificationSystem;
