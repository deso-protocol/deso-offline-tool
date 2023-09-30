export class NavButton extends HTMLButtonElement {
  get to() {
    return this.getAttribute("to");
  }

  static get observedAttributes() {
    return ["to"];
  }

  connectedCallback() {
    this.addEventListener("click", (event) => {
      const navEl = document.getElementById("main-nav");

      if (!navEl) {
        throw new Error("No nav element found for selector: #main-nav");
      }

      const oldActiveNavButton = navEl.querySelector(
        ".nav-button--active",
      ) as NavButton | null;

      if (!oldActiveNavButton) {
        throw new Error(
          "No active button found for selector: .nav-button--active",
        );
      }

      const oldActiveTabId = oldActiveNavButton.to;

      if (!oldActiveTabId) {
        throw new Error(
          "Missing data-tab attribute found for active nav button",
        );
      }

      const newActiveTabId = this.getAttribute("to");

      if (!newActiveTabId) {
        throw new Error("The to attribute is required for nav-button");
      }

      if (newActiveTabId === oldActiveTabId) {
        return;
      }

      const oldActiveTab = document.getElementById(oldActiveTabId);

      oldActiveTab?.classList.add("hidden");
      oldActiveNavButton?.classList.remove("nav-button--active");

      const newActiveTab = document.getElementById(newActiveTabId);
      const newActiveTabButton = navEl.querySelector(
        `[to='${newActiveTabId}']`,
      ) as HTMLButtonElement | null;

      if (!newActiveTab) {
        throw new Error(`No tab found for tab id ${newActiveTabId}`);
      }

      if (!newActiveTabButton) {
        throw new Error(
          `No active button found for selector: [to='${newActiveTabId}']`,
        );
      }

      newActiveTab.classList.remove("hidden");
      newActiveTabButton.classList.add("nav-button--active");

      window.history.pushState(
        {
          tabId: newActiveTabId,
        },
        "",
        `#${newActiveTabId}`,
      );
    });
  }

  constructor() {
    super();
    // If a nav button is embedded within a form, this prevents it from submitting the form inadvertently.
    // javascript doesn't have an override keyword, so we have to do it in the constructor.
    this.type = "button";
  }
}
