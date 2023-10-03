import { sendDeso } from "deso-protocol";
import { html, isValidPublicKey } from "../utils";
import { CopyToClipboard } from "./copy-to-clipboard";

interface TransferDeSoFormControls extends HTMLFormControlsCollection {
  senderPublicKey: HTMLInputElement;
  recipientPublicKey: HTMLInputElement;
  desoAmount: HTMLInputElement;
}

export class TransferDeSoForm extends HTMLElement {
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
          inputType="number"
          labelText="$DESO Amount"
          required="true"
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
        <button is="nav-button" class="inline-button" to="sign-tab">
          Sign Tab
        </button>
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

  constructor() {
    super();
    this.style.display = "block";
  }

  connectedCallback() {
    this.rehydratePage();

    // TODO: fix the number input... it's not very user friendly atm.

    const sendDesoTxnForm = this.querySelector("form");
    const copyTxnHexButton = this.querySelector(
      "#copyTxnHexButton",
    ) as CopyToClipboard | null;

    if (!copyTxnHexButton) {
      throw new Error(
        "No copy txn hex button found for selector: #copyTxnHexButton",
      );
    }

    sendDesoTxnForm?.addEventListener("input", () => {
      // clear errors any time the form changes.
      const errorEls = sendDesoTxnForm.querySelectorAll(
        "[data-error-for]",
      ) as NodeListOf<HTMLElement>;
      errorEls.forEach((el) => {
        el.textContent = "";
      });
    });

    sendDesoTxnForm?.addEventListener("submit", async function (event) {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formControls = form.elements as TransferDeSoFormControls;
      const senderPublicKey = formControls.senderPublicKey.value;
      const recipientPublicKey = formControls.recipientPublicKey.value;
      const desoAmount = Number(formControls.desoAmount.value);

      let isFormValid = true;
      if (!isValidPublicKey(senderPublicKey)) {
        isFormValid = false;
        const errorEl = this.querySelector(
          '[data-error-for="senderPublicKey"]',
        );

        if (!errorEl) {
          throw new Error(
            "No error element found for selector: [data-error-for='senderPublicKey']",
          );
        }

        errorEl.textContent = "Invalid public key.";
      }

      if (!isValidPublicKey(recipientPublicKey)) {
        isFormValid = false;
        const errorEl = this.querySelector(
          '[data-error-for="recipientPublicKey"]',
        );

        if (!errorEl) {
          throw new Error(
            "No error element found for selector: [data-error-for='senderPublicKey']",
          );
        }

        errorEl.textContent = "Invalid public key.";
      }

      if (isNaN(desoAmount) || desoAmount <= 0) {
        isFormValid = false;
        const errorEl = this.querySelector('[data-error-for="desoAmount"]');

        if (!errorEl) {
          throw new Error(
            "No error element found for selector: [data-error-for='senderPublicKey']",
          );
        }

        errorEl.textContent = "Invalid deso amount.";
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

    window.addEventListener("beforeunload", () => {
      const senderPublicKeyInput = this.querySelector(
        "#senderPublicKey",
      ) as HTMLInputElement | null;
      const recipientPublicKeyInput = this.querySelector(
        "#recipientPublicKey",
      ) as HTMLInputElement | null;
      const desoAmountInput = this.querySelector(
        "#desoAmount",
      ) as HTMLInputElement | null;

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
      ) as HTMLInputElement | null;
      const recipientPublicKeyInput = this.querySelector(
        "#recipientPublicKey",
      ) as HTMLInputElement | null;
      const desoAmountInput = this.querySelector(
        "#desoAmount",
      ) as HTMLInputElement | null;

      if (senderPublicKeyInput) {
        senderPublicKeyInput.value = senderPublicKey;
      }
      if (recipientPublicKeyInput) {
        recipientPublicKeyInput.value = recipientPublicKey;
      }
      if (desoAmountInput) {
        desoAmountInput.value = desoAmount;
      }
    }
  }
}
