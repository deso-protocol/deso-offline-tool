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
