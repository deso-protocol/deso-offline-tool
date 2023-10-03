export class BaseComponent extends HTMLElement {
  /**
   * Instead of returning null, throw an error if no element is found so we get
   * early feedback in development if we're using an bad selector. This can be
   * circumvented in cases where we don't expect the element to always be there
   * by simply using document.querySelector directly.
   *
   * @param selector
   * @returns
   */
  querySelector(selector: string) {
    const el = super.querySelector(selector);

    if (!el) {
      const errorMsg = `No element found for selector: ${selector}`;

      if (window.location.hostname === "localhost") {
        console.error(errorMsg);
        alert(
          `No element found for selector: ${selector}. Please check the console for a stack trace.`,
        );
      }

      throw new Error(errorMsg);
    }

    return el;
  }

  constructor() {
    super();
    this.style.display = "block";
  }
}
