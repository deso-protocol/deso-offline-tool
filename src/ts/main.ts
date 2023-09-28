import { initDownloadButton } from "./download";
import { initGenerateTxnTab } from "./generate-tx-tab";
import { initNav } from "./nav";
import { initNetworkStatusIndicator } from "./network-status";

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initNetworkStatusIndicator();
  initDownloadButton();
  initGenerateTxnTab();
});
