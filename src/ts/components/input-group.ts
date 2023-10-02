import { escapeHTML, html } from "../utils";

export class InputGroup extends HTMLElement {
  static get observedAttributes() {
    return [
      "labelText",
      "inputType",
      "inputPlaceholder",
      "inputValue",
      "inputId",
      "hintText",
      "isTextArea",
    ];
  }

  innerHTML = (() => {
    const labelText = escapeHTML(this.getAttribute("labelText") || "");
    const inputId = escapeHTML(this.getAttribute("inputId") || "");
    const inputType = escapeHTML(this.getAttribute("inputType") || "text");
    const inputPlaceHolder = escapeHTML(
      this.getAttribute("inputPlaceholder") || "",
    );
    const inputValue = escapeHTML(this.getAttribute("inputValue") || "");
    const hintText = escapeHTML(this.getAttribute("hintText") || "");
    const isTextArea = this.getAttribute("isTextArea") === "true";

    if (!inputId) {
      throw new Error("An input group must have an inputId attribute.");
    }

    if (!labelText) {
      throw new Error("An input group must have a labelText attribute.");
    }

    const hintTextHtml =
      hintText.length > 0
        ? html`<p class="secondary-text">${hintText}</p>`
        : "";

    const formControl = isTextArea
      ? html`
          <textarea
            is="auto-resizing-textarea"
            id="${inputId}"
            class="form-input"
            value="${inputValue}"
            placeholder="${inputPlaceHolder}"
            spellcheck="false"
            autocomplete="off"
          ></textarea>
        `
      : html`
          <input
            class="form-input"
            type="${inputType}"
            id="${inputId}"
            value="${inputValue}"
            placeholder="${inputPlaceHolder}"
            spellcheck="false"
            autocomplete="off"
          />
        `;
    return html`
      <div>
        <label for="${inputId}" class="block text-sm font-medium"
          >${labelText}</label
        >
        ${hintTextHtml} ${formControl}
      </div>
    `;
  })();
}
