import { sendDeso } from "deso-protocol";
import { addFormError, html, isValidPublicKey } from "../utils";
import { BaseComponent } from "./base-component";
import { CopyToClipboard } from "./copy-to-clipboard";

interface TransferDeSoFormControls extends HTMLFormControlsCollection {
  senderPublicKey: HTMLInputElement;
  recipientPublicKey: HTMLInputElement;
  desoAmount: HTMLInputElement;
}

export class TransferDeSoForm extends BaseComponent {
  innerHTML = html`
    <form>
      <section class="form-controls">
        <header>
          <h3>Transfer DeSo</h3>
        </header>
        <input-group
          inputId="senderPublicKey"
          labelText="Transactor Public Key"
          required="true"
        >
        </input-group>
        <input-group
          inputId="recipientPublicKey"
          labelText="Recipient Public Key"
          required="true"
        ></input-group>
        <input-group
          inputId="desoAmount"
          labelText="$DESO Amount"
          required="true"
          inputType="number"
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
        <a class="inline-button" href="#sign">Sign Tab</a>
        to sign it.
      </p>
      <div class="flex items-start mt-2">
        <div class="w-full copy-text-container">
          <span id="transactionHexContainer" class="break-words"></span>
        </div>
        <copy-to-clipboard id="copyTxnHexButton"></copy-to-clipboard>
      </div>
    </section>
  `;

  connectedCallback() {
    this.rehydratePage();

    const sendDesoTxnForm = this.querySelector("form");
    const copyTxnHexButton = this.querySelector(
      "#copyTxnHexButton",
    ) as CopyToClipboard;

    sendDesoTxnForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formControls = form.elements as TransferDeSoFormControls;
      const senderPublicKey = formControls.senderPublicKey.value;
      const recipientPublicKey = formControls.recipientPublicKey.value;
      const desoAmount = Number(formControls.desoAmount.value);

      let isFormValid = true;
      if (!isValidPublicKey(senderPublicKey)) {
        isFormValid = false;
        addFormError("senderPublicKey", "Invalid public key.");
      }

      if (!isValidPublicKey(recipientPublicKey)) {
        isFormValid = false;
        addFormError("recipientPublicKey", "Invalid public key.");
      }

      if (isNaN(desoAmount) || desoAmount <= 0) {
        isFormValid = false;
        addFormError("desoAmount", "Invalid deso amount.");
      }

      if (!isFormValid) {
        return;
      }

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

      const txHexSection = this.querySelector("#transactionHexSection");
      const txHexContainer = this.querySelector("#transactionHexContainer");

      const txHex = result.constructedTransactionResponse.TransactionHex;
      txHexContainer.textContent = txHex;
      txHexSection.classList.remove("hidden");

      copyTxnHexButton.text = txHex;
    });

    window.addEventListener("beforeunload", () => {
      const senderPublicKeyInput = this.querySelector(
        "#senderPublicKey",
      ) as HTMLInputElement;
      const recipientPublicKeyInput = this.querySelector(
        "#recipientPublicKey",
      ) as HTMLInputElement;
      const desoAmountInput = this.querySelector(
        "#desoAmount",
      ) as HTMLInputElement;

      window.localStorage?.setItem(
        "transferDeSoFormState",
        JSON.stringify({
          senderPublicKey: senderPublicKeyInput?.value ?? "",
          recipientPublicKey: recipientPublicKeyInput?.value ?? "",
          desoAmount: desoAmountInput?.value ?? "",
        }),
      );
    });
  }

  rehydratePage() {
    const transferDeSoFormStateJSON = window.localStorage?.getItem(
      "transferDeSoFormState",
    );
    if (transferDeSoFormStateJSON) {
      const { senderPublicKey, recipientPublicKey, desoAmount } = JSON.parse(
        transferDeSoFormStateJSON,
      );

      const senderPublicKeyInput = this.querySelector(
        "#senderPublicKey",
      ) as HTMLInputElement;
      const recipientPublicKeyInput = this.querySelector(
        "#recipientPublicKey",
      ) as HTMLInputElement;
      const desoAmountInput = this.querySelector(
        "#desoAmount",
      ) as HTMLInputElement;

      senderPublicKeyInput.value = senderPublicKey;
      recipientPublicKeyInput.value = recipientPublicKey;
      desoAmountInput.value = desoAmount;
    }
  }
}
