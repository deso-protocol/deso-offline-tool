import { CopyToClipboard } from "./components/copy-to-clipboard";
import { InputGroup } from "./components/input-group";
import { initDownloadButton } from "./download";
import { initGenerateTxnTab } from "./generate-tx-tab";
import { initNav } from "./nav";
import { initNetworkStatusIndicator } from "./network-status";
import { initSignTab } from "./sign";

window.customElements.define("copy-to-clipboard", CopyToClipboard);
window.customElements.define("input-group", InputGroup);

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initNetworkStatusIndicator();
  initDownloadButton();
  initGenerateTxnTab();
  initSignTab();
});
