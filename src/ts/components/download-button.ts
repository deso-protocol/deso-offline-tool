export class DownloadButton extends HTMLButtonElement {
  connectedCallback() {
    this.addEventListener("click", this.download);
  }

  // TODO: figure out how to zip this into a single file
  download() {
    // Download HTML
    let htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    let htmlBlob = new Blob([htmlContent], { type: "text/html" });
    downloadBlob(htmlBlob, "deso-offline-tool.html");

    // Download CSS
    fetch("style.css")
      .then((response) => response.text())
      .then((css) => {
        let cssBlob = new Blob([css], { type: "text/css" });
        downloadBlob(cssBlob, "style.css");
      });

    // Download JS
    fetch("main.js")
      .then((response) => response.text())
      .then((js) => {
        let jsBlob = new Blob([js], { type: "text/javascript" });
        downloadBlob(jsBlob, "main.js");
      });
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
