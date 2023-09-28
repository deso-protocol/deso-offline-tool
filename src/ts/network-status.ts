export function initNetworkStatusIndicator() {
  const networkOnlineEl = document.getElementById("networkOnlineIndicator");
  const networkOfflineEl = document.getElementById("networkOfflineIndicator");

  if (!networkOnlineEl) {
    throw new Error(
      "No network status element found for selector: #networkOnlineIndicator"
    );
  }

  if (!networkOfflineEl) {
    throw new Error(
      "No network status element found for selector: #networkOfflineIndicator"
    );
  }

  if (navigator.onLine) {
    networkOnlineEl.classList.remove("hidden");
    networkOfflineEl.classList.add("hidden");
  } else {
    networkOfflineEl.classList.remove("hidden");
    networkOnlineEl.classList.add("hidden");
  }

  window.addEventListener("offline", () => {
    networkOfflineEl.classList.remove("hidden");
    networkOnlineEl.classList.add("hidden");
  });

  window.addEventListener("online", () => {
    networkOnlineEl.classList.remove("hidden");
    networkOfflineEl.classList.add("hidden");
  });
}