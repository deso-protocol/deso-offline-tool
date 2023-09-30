export class AutoResizingTextarea extends HTMLTextAreaElement {
  constructor() {
    super();
    Object.assign(this.style, {
      resize: "none",
      overflow: "hidden",
      minHeight: "2rem",
    });
  }

  connectedCallback() {
    this.addEventListener("input", this.autoResize);
  }

  autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }
}
