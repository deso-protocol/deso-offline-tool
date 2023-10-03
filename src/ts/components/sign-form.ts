import { utils } from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { keygen, publicKeyToBase58Check, sign, signTx } from "deso-protocol";
import { addFormError, html, plainTextToHashHex } from "../utils";
import { BaseComponent } from "./base-component";
import { CopyToClipboard } from "./copy-to-clipboard";

interface EnterSeedFormControls extends HTMLFormControlsCollection {
  mnemonic: HTMLInputElement;
  passphrase: HTMLInputElement;
  seedHex: HTMLInputElement;
  accountNumber: HTMLInputElement;
}

interface SavedFormState extends HTMLFormControlsCollection {
  mnemonic: string;
  passphrase: string;
  seedHex: string;
  accountNumber: string;
}

interface SignTxFormControls extends HTMLFormControlsCollection {
  txnHexToSign: HTMLTextAreaElement;
}

interface SignMsgFormControls extends HTMLFormControlsCollection {
  msgToSign: HTMLTextAreaElement;
}

const selectors = {
  enterSeedForm: "#enterSeedForm",
  signTxForm: "#signTxForm",
  signMsgForm: "#signMsgForm",
};

export class SignForm extends BaseComponent {
  innerHTML = html`
    <form id="enterSeedForm">
      <section class="form-controls">
        <header class="mb-3">
          <h3>Enter Your DeSo Seed</h3>
        </header>
        <input-group
          labelText="DeSo Seed Phrase"
          inputId="mnemonic"
          inputPlaceholder="easily burden captain garment hidden gun economy road inner dance whisper buzz"
        ></input-group>
        <input-group
          labelText="Account Number"
          inputId="accountNumber"
          inputType="number"
          inputValue="0"
        ></input-group>
        <input-group
          labelText="Passphrase (optional)"
          inputId="passphrase"
        ></input-group>
        <p class="px-2">or</p>
        <input-group
          labelText="Seed Hex"
          inputId="seedHex"
          hintText="Only enter this if you do not have a seed phrase. If this is provided, the seed phrase, passphrase, and account number will be ignored."
        ></input-group>
      </section>
      <div>
        <button type="submit" class="primary-button">Next</button>
      </div>
    </form>
    <div id="signForms" class="hidden">
      <section id="publicKeyBase58Section" class="mb-10">
        <header>
          <h4>Public Key</h4>
        </header>
        <p class="secondary-text">
          Please confirm that this is the public key you expect to see.
        </p>
        <div class="mt-2 w-1/2 copy-text-container">
          <span id="publicKeyBase58Container" class="break-words"></span>
        </div>
      </section>
      <form id="signTxForm">
        <section class="form-controls">
          <header class="mb-3">
            <h3>Sign Transaction</h3>
            <p class="secondary-text">
              Sign a transaction so you can broadcast it on the
              <button
                is="nav-button"
                to="broadcast-txn-tab"
                class="inline-button"
              >
                Broadcast Tab</button
              >.
            </p>
          </header>
          <input-group
            inputId="txnHexToSign"
            labelText="Transaction Hex"
            hintText="Enter the hex of the transaction you want to sign."
            isTextArea="true"
          ></input-group>
        </section>
        <div>
          <button type="submit" class="primary-button">Sign</button>
        </div>
        <div id="signedTxHexContainer" class="mt-10 hidden">
          <p class="text-sm">Signed Txn Hex</p>
          <p class="secondary-text">
            Broadcast this via the
            <button
              is="nav-button"
              to="broadcast-txn-tab"
              class="inline-button"
            >
              Broadcast Tab
            </button>
            when online.
          </p>
          <div class="flex items-end w-3/4 mt-2">
            <div class="copy-text-container">
              <span id="signedTxHex" class="break-words"></span>
            </div>
            <copy-to-clipboard id="copySignedTxnHexButton"></copy-to-clipboard>
          </div>
        </div>
      </form>
      <form id="signMsgForm">
        <section class="form-controls">
          <header class="mb-3">
            <h3>Sign Message</h3>
            <p class="secondary-text">
              Sign an arbitrary message that anyone can verify on the
              <button
                is="nav-button"
                class="inline-button"
                to="verify-signature-tab"
              >
                Verify Tab</button
              >.
            </p>
          </header>
          <input-group
            inputId="msgToSign"
            labelText="Message Text"
            isTextArea="true"
          ></input-group>
        </section>
        <div>
          <button type="submit" class="primary-button">Sign</button>
        </div>
        <div id="signedMsgSignatureContainer" class="mt-10 hidden">
          <p class="text-sm">Message Signature</p>
          <p class="secondary-text">
            Other users can verify that this message was signed by you using the
            <button
              is="nav-button"
              to="verify-signature-tab"
              class="inline-button"
            >
              Verify Tab
            </button>
            when online.
          </p>
          <div class="flex items-end mt-2 w-3/4">
            <div class="copy-text-container">
              <span id="signedMsgSignature" class="break-words"></span>
            </div>
            <copy-to-clipboard
              id="copySignedMsgSignatureButton"
            ></copy-to-clipboard>
          </div>
        </div>
      </form>
    </div>
  `;

  privateKeyHex = "";

  connectedCallback() {
    this.rehydratePage();

    const enterSeedForm = this.querySelector(selectors.enterSeedForm);
    const signTxForm = this.querySelector(selectors.signTxForm);
    const signMsgForm = this.querySelector(selectors.signMsgForm);

    enterSeedForm.addEventListener("input", () => {
      const signFormsEl = this.querySelector("#signForms");
      signFormsEl?.classList.add("hidden");
    });

    enterSeedForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formControls = form.elements as EnterSeedFormControls;

      const seedHex = formControls.seedHex.value;
      let publicKeyBytes: Uint8Array | null = null;

      // If we're given the seed hex, we can skip the mnemonic, passphrase, and account number.
      if (seedHex) {
        try {
          const keys = keygen(seedHex);
          this.privateKeyHex = seedHex;
          publicKeyBytes = keys.public;
        } catch (e) {
          addFormError("seedHex", String(e));
          console.error(e);
        }
        return;
      }

      const accountNumber = Number(formControls.accountNumber.value);

      if (isNaN(accountNumber) || accountNumber < 0) {
        addFormError("accountNumber", "Invalid account number.");
      }

      let masterSeed: Uint8Array | null = null;

      try {
        masterSeed = mnemonicToSeedSync(
          formControls.mnemonic.value,
          formControls.passphrase.value,
        );
      } catch (e) {
        addFormError("mnemonic", String(e));
        console.error(e);
        return;
      }

      try {
        const keys = HDKey.fromMasterSeed(masterSeed).derive(
          `m/44'/0'/${accountNumber}'/0/0`,
        );

        if (!keys.privateKey) {
          throw new Error("Problem generating key pair from seed.");
        }

        this.privateKeyHex = keygen(keys.privateKey).seedHex;

        if (!keys.publicKey) {
          throw new Error("Problem generating key pair from seed.");
        }

        publicKeyBytes = keys.publicKey;
      } catch (e) {
        const message = String(e);
        if (message.startsWith("Error: Invalid child index")) {
          addFormError("accountNumber", message);
        } else {
          addFormError("mnemonic", message);
        }
        console.error(e);
      }

      if (!publicKeyBytes) {
        throw new Error("Could not generate public key.");
      }

      this.confirmPublicKey(publicKeyBytes);
    });

    signTxForm.addEventListener("input", () => {
      // clear any signature that was previously generated.
      const signedTxnHexEl = this.querySelector("#signedTxHexContainer");
      signedTxnHexEl.classList.add("hidden");
    });

    signTxForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const form = event.target as HTMLFormElement;
        const txnHex = (form.elements as SignTxFormControls).txnHexToSign.value;

        if (!txnHex) {
          throw new Error("No transaction hex provided.");
        }

        if (this.privateKeyHex.length === 0) {
          throw new Error("No private key set.");
        }
        const signedTxnHex = await signTx(txnHex.trim(), this.privateKeyHex);
        const signedTxnHexEl = this.querySelector("#signedTxHex");
        const copySignedTxnHexButton = this.querySelector(
          "#copySignedTxnHexButton",
        ) as CopyToClipboard;

        signedTxnHexEl.textContent = signedTxnHex;
        copySignedTxnHexButton.text = signedTxnHex;

        this.querySelector("#signedTxHexContainer").classList.remove("hidden");
      } catch (e) {
        addFormError("txnHexToSign", String(e));
        console.error(e);
      }
    });

    signMsgForm.addEventListener("input", () => {
      // clear any signature that was previously generated.
      this.querySelector("#signedMsgSignatureContainer").classList.add(
        "hidden",
      );
    });

    signMsgForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const form = event.target as HTMLFormElement;
        const message = (form.elements as SignMsgFormControls).msgToSign.value;

        if (!message) {
          throw new Error("No message provided.");
        }

        if (this.privateKeyHex.length === 0) {
          throw new Error("No private key set.");
        }
        const keys = keygen(this.privateKeyHex);
        const messageHashHex = plainTextToHashHex(message);
        const [signatureBytes] = await sign(messageHashHex, keys.private);
        const signatureHex = utils.bytesToHex(signatureBytes);
        const signedMsgEl = this.querySelector("#signedMsgSignature");
        const copySignedMsgButton = this.querySelector(
          "#copySignedMsgSignatureButton",
        ) as CopyToClipboard;

        signedMsgEl.textContent = signatureHex;
        copySignedMsgButton.text = signatureHex;

        this.querySelector("#signedMsgSignatureContainer").classList.remove(
          "hidden",
        );
      } catch (e) {
        addFormError("msgToSign", String(e));
        console.error(e);
      }
    });

    window.addEventListener("beforeunload", () => {
      const accountNumberInput = this.querySelector(
        "#accountNumber",
      ) as HTMLInputElement | null;
      const mnemonicInput = this.querySelector(
        "#mnemonic",
      ) as HTMLInputElement | null;
      const passphraseInput = this.querySelector(
        "#passphrase",
      ) as HTMLInputElement | null;
      const seedHexInput = this.querySelector(
        "#seedHex",
      ) as HTMLInputElement | null;

      window.localStorage?.setItem(
        "signFormState",
        JSON.stringify({
          accountNumber: accountNumberInput?.value ?? 0,
          mnemonic: mnemonicInput?.value ?? "",
          passphrase: passphraseInput?.value ?? "",
          seedHex: seedHexInput?.value ?? "",
        }),
      );
    });
  }

  confirmPublicKey(publicKeyBytes: Uint8Array) {
    const publicKeyEl = this.querySelector("#publicKeyBase58Container");
    const signFormsEl = this.querySelector("#signForms");

    publicKeyEl.textContent = publicKeyToBase58Check(publicKeyBytes);
    signFormsEl.classList.remove("hidden");

    publicKeyEl.scrollIntoView({
      behavior: "smooth",
    });
  }

  rehydratePage() {
    const savedFormStateJSON = window.localStorage.getItem("signFormState");
    if (savedFormStateJSON) {
      const { mnemonic, seedHex, accountNumber, passphrase } = JSON.parse(
        savedFormStateJSON,
      ) as SavedFormState;
      const accountNumberInput = this.querySelector(
        "#accountNumber",
      ) as HTMLInputElement;
      const mnemonicInput = this.querySelector("#mnemonic") as HTMLInputElement;
      const passphraseInput = this.querySelector(
        "#passphrase",
      ) as HTMLInputElement;
      const seedHexInput = this.querySelector("#seedHex") as HTMLInputElement;

      accountNumberInput.value = accountNumber;
      mnemonicInput.value = mnemonic;
      passphraseInput.value = passphrase;
      seedHexInput.value = seedHex;

      if (seedHex.length > 0) {
        this.privateKeyHex = seedHex;
        try {
          this.confirmPublicKey(keygen(seedHex).public);
        } catch (e) {
          addFormError("seedHex", String(e));
          console.error(e);
        }
      } else if (mnemonic.length > 0) {
        try {
          const keys = HDKey.fromMasterSeed(
            mnemonicToSeedSync(mnemonic, passphrase),
          ).derive(`m/44'/0'/${Number(accountNumber)}'/0/0`);
          if (!(keys.privateKey && keys.publicKey)) {
            throw new Error("Problem generating key pair from seed.");
          }

          this.privateKeyHex = keygen(keys.privateKey).seedHex;
          this.confirmPublicKey(keys.publicKey);
        } catch (e) {
          const message = String(e);
          if (message.startsWith("Error: Invalid child index")) {
            addFormError("accountNumber", message);
          } else {
            addFormError("mnemonic", message);
          }
          console.error(e);
        }
      }
    }
  }
}
