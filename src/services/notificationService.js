const mockNotifications = [
  {
    id: "notif1",
    message: "Seu evento 'Feira de Artesanato Local' foi aprovado!",
    type: "success",
    read: false,
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "notif2",
    message: "Nova reclamação 'Buraco na Rua Principal' foi registrada perto de você.",
    type: "info",
    read: false,
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "notif3",
    message: "Lembrete: 'Show de Rock no Parque' é amanhã!",
    type: "warning",
    read: true,
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
];

let notifications = [...mockNotifications];

export const getNotifications = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }, 500);
  });
};

export const markNotificationAsRead = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      );
      resolve({ success: true });
    }, 300);
  });
};

export const addNotification = async (newNotification) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notificationWithId = {
        id: `notif${notifications.length + 1}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...newNotification,
      };
      notifications.unshift(notificationWithId);
      resolve(notificationWithId);
    }, 300);
  });
};

export const deleteNotification = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.filter((notif) => notif.id !== id);
      resolve({ success: true });
    }, 300);
  });
};



export const subscribeToPushNotifications = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array("YOUR_PUBLIC_VAPID_KEY"), // Substitua pela sua chave VAPID pública
    });
    console.log("Push Subscription:", JSON.stringify(subscription));
    // Em um cenário real, você enviaria essa subscription para o seu backend
    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
};

export const sendMockPushNotification = async (title, body, url) => {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker not available.");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if (registration && registration.active) {
    // Simular o envio de uma notificação push do servidor
    // Em um cenário real, o servidor enviaria a notificação para o Service Worker
    registration.active.postMessage({
      type: "MOCK_PUSH",
      payload: { title, body, url },
    });
  }
};

// Função auxiliar para converter VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

