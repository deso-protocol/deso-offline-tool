import { sendDeso } from "deso-protocol";

interface TransferDeSoFormControls extends HTMLFormControlsCollection {
  senderPublicKey: HTMLInputElement;
  recipientPublicKey: HTMLInputElement;
  desoAmount: HTMLInputElement;
}

export function initGenerateTxnTab() {
  const sendDesoTxnForm = document.getElementById("send-deso-txn-form");
  const copyTxnHexButton = document.getElementById("copyTxnHexButton");
  let currentTransactionHex = "";

  sendDesoTxnForm?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formControls = form.elements as TransferDeSoFormControls;

    // TODD: Validate form

    const senderPublicKey = formControls.senderPublicKey.value;
    const recipientPublicKey = formControls.recipientPublicKey.value;
    const desoAmount = Number(formControls.desoAmount.value);

    // NOTE: local construction requires calling a node to get the current block
    // height so it is not actually offline.
    const result = await sendDeso(
      {
        SenderPublicKeyBase58Check: senderPublicKey,
        RecipientPublicKeyOrUsername: recipientPublicKey,
        AmountNanos: desoAmount * 1e9,
      },
      {
        checkPermissions: false,
        broadcast: false,
      }
    );

    const txHexSection = document.getElementById("transactionHexSection");

    if (!txHexSection) {
      throw new Error(
        "No transaction hex section found for selector: #transactionHexSection"
      );
    }

    const txHexContainer = txHexSection.querySelector(
      "#transactionHexContainer"
    );

    if (!txHexContainer) {
      throw new Error(
        "No transaction hex container found for selector: #transactionHexContainer"
      );
    }

    currentTransactionHex =
      result.constructedTransactionResponse.TransactionHex;
    txHexContainer.textContent = currentTransactionHex;
    txHexSection.classList.remove("hidden");
  });

  copyTxnHexButton?.addEventListener("click", function () {
    document.getElementById("copyTxnHexButtonIcon")?.classList.add("hidden");
    document
      .getElementById("copyCheckTxnHexButtonIcon")
      ?.classList.remove("hidden");

    window.navigator.clipboard.writeText(currentTransactionHex).then(() => {
      setTimeout(() => {
        document
          .getElementById("copyTxnHexButtonIcon")
          ?.classList.remove("hidden");
        document
          .getElementById("copyCheckTxnHexButtonIcon")
          ?.classList.add("hidden");
      }, 2000);
    });
  });
}
