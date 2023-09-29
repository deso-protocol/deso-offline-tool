import { escape, html } from "../utils";

export class InputGroup extends HTMLElement {
  static get observedAttributes() {
    return [
      "labelText",
      "inputType",
      "inputPlaceholder",
      "inputValue",
      "inputId",
      "hintText",
    ];
  }

  innerHTML = (() => {
    const label = escape(this.getAttribute("labelText") || "");
    const id = escape(this.getAttribute("inputId") || "");
    const type = escape(this.getAttribute("inputType") || "text");
    const placeholder = escape(this.getAttribute("inputPlaceholder") || "");
    const value = escape(this.getAttribute("inputValue") || "");
    const hintText = escape(this.getAttribute("hintText") || "");

    if (!id) {
      throw new Error("Input group must have an id");
    }

    if (!label) {
      throw new Error("Input group must have a label");
    }

    const hintTextHtml =
      hintText.length > 0
        ? html`<p class="secondary-text">${hintText}</p>`
        : "";

    return html`
      <div>
        <label for="${id}" class="block text-sm font-medium">${label}</label>
        ${hintTextHtml}
        <input
          class="block w-full mt-2 rounded-md border-0 p-1.5 bg-white/5 text-white text-sm shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          type="${type}"
          id="${id}"
          value="${value}"
          placeholder="${placeholder}"
          spellcheck="false"
          autocomplete="off"
        />
      </div>
    `;
  })();
}
