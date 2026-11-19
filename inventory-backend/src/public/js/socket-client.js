(function () {
  if (typeof io === "undefined") {
    return;
  }

  const socket = io();
  const statusBox = document.getElementById("socket-status");

  const showMessage = (message) => {
    if (!statusBox) {
      return;
    }

    statusBox.textContent = message;
    statusBox.classList.remove("hidden");
  };

  socket.on("stock:connected", (payload) => {
    showMessage(payload.message);
  });

  socket.on("stock:update", (payload) => {
    showMessage(
      `${payload.itemName} updated via ${payload.transactionType}. New stock: ${payload.quantity}`
    );

    document.querySelectorAll(`[data-item-id="${payload.itemId}"] .live-quantity`).forEach((node) => {
      node.textContent = payload.quantity;
    });
  });
})();
