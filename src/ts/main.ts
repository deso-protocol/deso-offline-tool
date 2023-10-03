import { AutoResizingTextarea } from "./components/auto-resizing-textarea";
import { BroadcastForm } from "./components/broadcast-form";
import { CopyToClipboard } from "./components/copy-to-clipboard";
import { DeSoLogo } from "./components/deso-logo";
import { DownloadButton } from "./components/download-button";
import { InputGroup } from "./components/input-group";
import { NetworkStatusIndicator } from "./components/network-status-indicator";
import { SignForm } from "./components/sign-form";
import { SVGIcon } from "./components/svg-icon";
import { TransferDeSoForm } from "./components/transfer-deso-form";
import { VerifySignatureForm } from "./components/verify-signature-form";
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
define("transfer-deso-form", TransferDeSoForm);
define("sign-form", SignForm);
define("auto-resizing-textarea", AutoResizingTextarea, {
  extends: "textarea",
});
define("verify-signature-form", VerifySignatureForm);
define("broadcast-form", BroadcastForm);

document.addEventListener("DOMContentLoaded", function () {
  initNav();
});
