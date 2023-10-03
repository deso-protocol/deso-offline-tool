import { html } from "../utils";
import { BaseComponent } from "./base-component";

export class CopyToClipboard extends BaseComponent {
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

  innerHTML = html`
    <button
      type="button"
      aria-label="Copy to clipboard"
      class="ml-3 text-gray-300 bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
    >
      <svg-icon icon="copy"></svg-icon>
      <svg-icon icon="check" class="hidden"></svg-icon>
    </button>
  `;

  connectedCallback() {
    this.addEventListener("click", this.copyToClipboard);
  }

  copyToClipboard() {
    window.navigator.clipboard
      .writeText(this._text)
      .then(() => {
        this.querySelector('[icon="copy"]').classList.add("hidden");
        this.querySelector('[icon="check"]').classList.remove("hidden");

        setTimeout(() => {
          this.querySelector('[icon="check"]').classList.add("hidden");
          this.querySelector('[icon="copy"]').classList.remove("hidden");
        }, 2000);
      })
      .catch((err) => {
        alert(`error copying: ${this._text}`);
      });
  }
}
