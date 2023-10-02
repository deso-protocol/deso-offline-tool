import { utils } from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { keygen, publicKeyToBase58Check, sign, signTx } from "deso-protocol";
import { html, plainTextToHashHex } from "../utils";
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

export class SignForm extends HTMLElement {
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
    <section id="publicKeyBase58Section" class="hidden mb-10">
      <header>
        <h4>Public Key</h4>
      </header>
      <p class="secondary-text">
        Please confirm that this is the public key you expect to see.
      </p>
      <div
        class="mt-2 w-1/2 rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 p-1.5"
      >
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
        <p>Signed Txn Hex</p>
        <p class="secondary-text">
          Broadcast this via the
          <button is="nav-button" to="broadcast-txn-tab" class="inline-button">
            Broadcast Tab
          </button>
          when online.
        </p>
        <div class="flex items-end w-3/4">
          <div class="form-input">
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
        <p>Message Signature</p>
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
        <div class="flex items-end w-3/4">
          <div class="form-input">
            <span id="signedMsgSignature" class="break-words"></span>
          </div>
          <copy-to-clipboard
            id="copySignedMsgSignatureButton"
          ></copy-to-clipboard>
        </div>
      </div>
    </form>
  `;

  privateKeyHex = "";

  constructor() {
    super();
    this.style.display = "block";
  }

  connectedCallback() {
    const enterSeedForm = this.querySelector(selectors.enterSeedForm);
    const signTxForm = this.querySelector(selectors.signTxForm);
    const signMsgForm = this.querySelector(selectors.signMsgForm);

    if (!enterSeedForm) {
      throw new Error(`No form found for selector: ${selectors.enterSeedForm}`);
    }

    if (!signTxForm) {
      throw new Error(`No form found for selector: ${selectors.signTxForm}`);
    }

    if (!signMsgForm) {
      throw new Error(`No form found for selector: ${selectors.signMsgForm}`);
    }

    this.rehydratePage();

    enterSeedForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formControls = form.elements as EnterSeedFormControls;

      const seedHex = formControls.seedHex.value;

      // If we're given the seed hex, we can skip the mnemonic, passphrase, and account number.
      if (seedHex) {
        const keys = keygen(seedHex);
        this.privateKeyHex = seedHex;
        this.confirmPublicKey(keys.public);
        return;
      }

      // TODO: validate form data
      const mnemonic = formControls.mnemonic.value;
      const passphrase = formControls.passphrase.value;
      const accountNumber = Number(formControls.accountNumber.value);
      const masterSeed = mnemonicToSeedSync(mnemonic, passphrase);
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

      this.confirmPublicKey(keys.publicKey);
      return;
    });

    signTxForm.addEventListener("submit", async (event) => {
      event.preventDefault();
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
      ) as CopyToClipboard | null;

      if (!signedTxnHexEl) {
        throw new Error(
          "No signed transaction hex element found for selector: #signedTxHex",
        );
      }

      if (!copySignedTxnHexButton) {
        throw new Error(
          "No copy signed transaction hex button found for selector: #copySignedTxnHexButton",
        );
      }

      signedTxnHexEl.textContent = signedTxnHex;
      copySignedTxnHexButton.text = signedTxnHex;

      this.querySelector("#signedTxHexContainer")?.classList.remove("hidden");
    });

    signMsgForm.addEventListener("submit", async (event) => {
      event.preventDefault();
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
      console.log(messageHashHex);
      const [signatureBytes] = await sign(messageHashHex, keys.private);
      const signatureHex = utils.bytesToHex(signatureBytes);
      const signedMsgEl = this.querySelector("#signedMsgSignature");
      const copySignedMsgButton = this.querySelector(
        "#copySignedMsgSignatureButton",
      ) as CopyToClipboard | null;

      if (!signedMsgEl) {
        throw new Error(
          "No signature element found for selector: #signedMsgSignature",
        );
      }

      if (!copySignedMsgButton) {
        throw new Error(
          "No copy signature button found for selector: #copySignedMsgSignatureButton",
        );
      }

      signedMsgEl.textContent = signatureHex;
      copySignedMsgButton.text = signatureHex;

      this.querySelector("#signedMsgSignatureContainer")?.classList.remove(
        "hidden",
      );
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
    const publicKeySectionEl = this.querySelector("#publicKeyBase58Section");

    if (!publicKeyEl) {
      throw new Error(
        "No public key element found for selector: #publicKeyBase58Container",
      );
    }

    if (!publicKeySectionEl) {
      throw new Error(
        "No public key section element found for selector: #publicKeyBase58Section",
      );
    }

    publicKeyEl.textContent = publicKeyToBase58Check(publicKeyBytes);
    publicKeySectionEl.classList.remove("hidden");

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
      const accountNumberInput = document.getElementById(
        "accountNumber",
      ) as HTMLInputElement | null;
      const mnemonicInput = document.getElementById(
        "mnemonic",
      ) as HTMLInputElement | null;
      const passphraseInput = document.getElementById(
        "passphrase",
      ) as HTMLInputElement | null;
      const seedHexInput = document.getElementById(
        "seedHex",
      ) as HTMLInputElement | null;

      if (accountNumberInput) {
        accountNumberInput.value = accountNumber;
      }

      if (mnemonicInput) {
        mnemonicInput.value = mnemonic;
      }

      if (passphraseInput) {
        passphraseInput.value = passphrase;
      }

      if (seedHexInput) {
        seedHexInput.value = seedHex;
      }

      if (seedHex.length > 0) {
        this.privateKeyHex = seedHex;
        this.confirmPublicKey(keygen(seedHex).public);
      } else if (mnemonic.length > 0) {
        const keys = HDKey.fromMasterSeed(
          mnemonicToSeedSync(mnemonic, passphrase),
        ).derive(`m/44'/0'/${Number(accountNumber)}'/0/0`);
        if (!(keys.privateKey && keys.publicKey)) {
          throw new Error("Problem generating key pair from seed.");
        }

        this.privateKeyHex = keygen(keys.privateKey).seedHex;
        this.confirmPublicKey(keys.publicKey);
      }
    }
  }
}
