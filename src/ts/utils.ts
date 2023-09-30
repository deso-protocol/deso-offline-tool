// NOTE: this doesn't really do anything. It's just a signal to dev tooling
// to get syntax highlighting and formatting to work for HTML in template
// strings https://prettier.io/docs/en/options.html#embedded-language-formatting.
export const html = String.raw;

export function escape(str: string) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Shared mutable state
interface SharedState {
  privateKeyHex?: string;
}
export const sharedState: SharedState = {};
