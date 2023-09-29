import { sendDeso } from "deso-protocol";
import { html } from "../utils";
import { CopyToClipboard } from "./copy-to-clipboard";

interface TransferDeSoFormControls extends HTMLFormControlsCollection {
  senderPublicKey: HTMLInputElement;
  recipientPublicKey: HTMLInputElement;
  desoAmount: HTMLInputElement;
}

export class TransferDeSoForm extends HTMLElement {
  innerHTML = html`
    <form class="w-1/2">
      <section class="form-controls">
        <header>
          <h3>Transfer DeSo</h3>
        </header>
        <input-group
          inputId="senderPublicKey"
          labelText="Transactor Public Key"
        ></input-group>
        <input-group
          inputId="recipientPublicKey"
          labelText="Recipient Public Key"
        ></input-group>
        <input-group
          inputId="desoAmount"
          inputType="number"
          labelText="$DESO Amount"
        ></input-group>
      </section>
      <div>
        <button type="submit" class="primary-button">Generate</button>
      </div>
    </form>
    <section id="transactionHexSection" class="hidden">
      <header>
        <h4>Transaction Hex</h4>
      </header>
      <p class="secondary-text">
        You can enter this on the
        <button is="nav-button" class="inline-button" to="sign-txn-tab">
          Sign Tab
        </button>
        to sign it.
      </p>
      <div class="flex items-start mt-2">
        <div
          class="w-3/4 rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 p-1.5"
        >
          <span id="transactionHexContainer" class="break-words"></span>
        </div>
        <copy-to-clipboard id="copyTxnHexButton"></copy-to-clipboard>
      </div>
    </section>
  `;

  connectedCallback() {
    const sendDesoTxnForm = this.querySelector("form");
    const copyTxnHexButton = this.querySelector(
      "#copyTxnHexButton",
    ) as CopyToClipboard | null;

    if (!copyTxnHexButton) {
      throw new Error(
        "No copy txn hex button found for selector: #copyTxnHexButton",
      );
    }

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
        },
      );

      const txHexSection = document.getElementById("transactionHexSection");

      if (!txHexSection) {
        throw new Error(
          "No transaction hex section found for selector: #transactionHexSection",
        );
      }

      const txHexContainer = txHexSection.querySelector(
        "#transactionHexContainer",
      );

      if (!txHexContainer) {
        throw new Error(
          "No transaction hex container found for selector: #transactionHexContainer",
        );
      }

      const txHex = result.constructedTransactionResponse.TransactionHex;
      txHexContainer.textContent = txHex;
      txHexSection.classList.remove("hidden");

      const signTxInput = document.getElementById(
        "transactionHexToSign",
      ) as HTMLInputElement | null;

      if (signTxInput) {
        signTxInput.value = txHex;
      }

      copyTxnHexButton.text = txHex;
    });
  }
}
