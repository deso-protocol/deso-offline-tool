import { html } from "../utils";

export class NetworkStatusIndicator extends HTMLElement {
  innerHTML = html`
    <span id="networkOnlineIndicator" class="flex flex-col items-center">
      <svg-icon icon="wifi" class="text-green-500"></svg-icon>
      <span class="text-gray-300 text-xs">online</span>
    </span>
    <span
      id="networkOfflineIndicator"
      class="flex flex-col items-center hidden"
    >
      <svg-icon icon="wifi-off" class="text-orange-500"></svg-icon>
      <span class="text-gray-300 text-xs">offline</span>
    </span>
  `;

  connectedCallback() {
    const networkOnlineEl = this.querySelector("#networkOnlineIndicator");
    const networkOfflineEl = this.querySelector("#networkOfflineIndicator");

    if (!networkOnlineEl) {
      throw new Error(
        "No network status element found for selector: #networkOnlineIndicator",
      );
    }

    if (!networkOfflineEl) {
      throw new Error(
        "No network status element found for selector: #networkOfflineIndicator",
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
}
