import { AutoResizingTextarea } from "./components/auto-resizing-textarea";
import { CopyToClipboard } from "./components/copy-to-clipboard";
import { DeSoLogo } from "./components/deso-logo";
import { DownloadButton } from "./components/download-button";
import { EnterSeedForm } from "./components/enter-seed-form";
import { InputGroup } from "./components/input-group";
import { NavButton } from "./components/nav-button";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { SVGIcon } from "./components/svg-icon";
import { TransferDeSoForm } from "./components/transfer-deso-form";
import { initNav } from "./init-nav";

const define = window.customElements.define.bind(window.customElements);

define("copy-to-clipboard", CopyToClipboard);
define("input-group", InputGroup);
define("svg-icon", SVGIcon);
define("deso-logo", DeSoLogo);
define("network-status-indicator", NetworkStatusIndicator);
define("download-button", DownloadButton, {
  extends: "button",
});
define("nav-button", NavButton, { extends: "button" });
define("transfer-deso-form", TransferDeSoForm);
define("enter-seed-form", EnterSeedForm);
define("auto-resizing-textarea", AutoResizingTextarea, {
  extends: "textarea",
});

document.addEventListener("DOMContentLoaded", function () {
  initNav();
});
