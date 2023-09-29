import { CopyToClipboard } from "./components/copy-to-clipboard";
import { DeSoLogo } from "./components/deso-logo";
import { DownloadButton } from "./components/download-button";
import { InputGroup } from "./components/input-group";
import { NavButton } from "./components/nav-button";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { SVGIcon } from "./components/svg-icon";
import { TransferDeSoForm } from "./components/transfer-deso-form";
import { initNav } from "./init-nav";
import { initSignTab } from "./sign";

window.customElements.define("copy-to-clipboard", CopyToClipboard);
window.customElements.define("input-group", InputGroup);
window.customElements.define("svg-icon", SVGIcon);
window.customElements.define("deso-logo", DeSoLogo);
window.customElements.define(
  "network-status-indicator",
  NetworkStatusIndicator,
);
window.customElements.define("download-button", DownloadButton, {
  extends: "button",
});
window.customElements.define("nav-button", NavButton, { extends: "button" });
window.customElements.define("transfer-deso-form", TransferDeSoForm);

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initSignTab();
});
