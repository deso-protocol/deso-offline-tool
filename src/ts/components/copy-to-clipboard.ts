import { html } from "../utils";

export class CopyToClipboard extends HTMLElement {
  _text: string = "";

  get text() {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
    this.setAttribute("text", value);
  }

  static get observedAttributes() {
    return ["text"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case "text":
        this._text = newValue;
        break;
    }
  }

  innerHTML = html`
    <button
      class="ml-3 text-gray-300 bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
    >
      <svg
        data-icon="copy"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path
          d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        ></path>
      </svg>
      <svg
        data-icon="check"
        class="hidden"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </button>
  `;

  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", this.copyToClipboard);
  }

  copyToClipboard() {
    window.navigator.clipboard
      .writeText(this._text)
      .then(() => {
        document.querySelector('[data-icon="copy"]')?.classList.add("hidden");
        document
          .querySelector('[data-icon="check"]')
          ?.classList.remove("hidden");

        setTimeout(() => {
          document
            .querySelector('[data-icon="check"]')
            ?.classList.add("hidden");
          document
            .querySelector('[data-icon="copy"]')
            ?.classList.remove("hidden");
        }, 2000);
      })
      .catch((err) => {
        alert(`error copying: ${this._text}`);
      });
  }
}
