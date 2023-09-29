export const html = String.raw;

// TODO: I don't think we actually need this...
export function escape(str: string) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
