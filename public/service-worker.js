self.addEventListener("push", (event) => {
  const data = event.data.json();
  console.log("Push received:", data);

  const title = data.title || "Mapa da Realidade";
  const options = {
    body: data.body,
    icon: "/logo192.png", // Certifique-se de ter um ícone na pasta public
    badge: "/badge.png", // Opcional, para mostrar um ícone menor
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(clients.claim());
});


self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "MOCK_PUSH") {
    const { title, body, url } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: "/logo192.png",
      data: { url },
    });
  }
});

