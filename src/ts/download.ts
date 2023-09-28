export function initDownloadButton() {
  const downloadButton = document.getElementById("download-button");

  if (!downloadButton) {
    throw new Error("No download button found for selector: #download-button");
  }

  downloadButton.addEventListener("click", function () {
    // TODO: Download zip file with all files in it...

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
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
