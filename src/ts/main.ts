import { CopyToClipboard } from "./components/copy-to-clipboard";
import { DeSoLogo } from "./components/deso-logo";
import { InputGroup } from "./components/input-group";
import { SVGIcon } from "./components/svg-icon";
import { initDownloadButton } from "./download";
import { initGenerateTxnTab } from "./generate-tx-tab";
import { initNav } from "./nav";
import { initNetworkStatusIndicator } from "./network-status";
import { initSignTab } from "./sign";

window.customElements.define("copy-to-clipboard", CopyToClipboard);
window.customElements.define("input-group", InputGroup);
window.customElements.define("svg-icon", SVGIcon);
window.customElements.define("deso-logo", DeSoLogo);

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initNetworkStatusIndicator();
  initDownloadButton();
  initGenerateTxnTab();
  initSignTab();
});
