import { sha256 } from "@noble/hashes/sha256";
import { utils } from "@noble/secp256k1";
import { bs58PublicKeyToBytes } from "deso-protocol";

// This doesn't really do anything. It's just a signal to dev tooling to get
// syntax highlighting and formatting to work for HTML in template strings
// https://prettier.io/docs/en/options.html#embedded-language-formatting.
export const html = String.raw;

// textContent is generally considered a safe for XSS attacks because it
// automatically encodes HTML to html entities. Here we pass any potentially
// unsafe strings through textContent to sanitize them. This app is mostly for
// offline use, so we don't need to worry about it too much, but just for
// completeness we escape variables that are used in HTML.
// https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-for-html-contexts
export function escapeHTML(str: string) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

export function plainTextToHashHex(plaintext: string) {
  const bytes = new TextEncoder().encode(plaintext);
  const hash = sha256(bytes);

  return utils.bytesToHex(hash);
}

export function isValidPublicKey(publicKey: string) {
  if (!(publicKey.startsWith("BC") || publicKey.startsWith("tBC"))) {
    return false;
  }

  try {
    // If the public key cannot be decoded into bytes, then it is invalid.
    bs58PublicKeyToBytes(publicKey);
  } catch (e) {
    return false;
  }

  return true;
}
