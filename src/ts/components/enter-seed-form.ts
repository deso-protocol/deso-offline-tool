import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { keygen, publicKeyToBase58Check } from "deso-protocol";
import { html, sharedState } from "../utils";

interface EnterSeedFormControls extends HTMLFormControlsCollection {
  mnemonic: HTMLInputElement;
  passphrase: HTMLInputElement;
  seedHex: HTMLInputElement;
  accountNumber: HTMLInputElement;
}

export class EnterSeedForm extends HTMLElement {
  innerHTML = html`
    <form>
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
        <input-group
          labelText="Seed Hex"
          inputId="seedHex"
          hintText="Only enter this if you do not have a seed phrase."
        ></input-group>
      </section>
      <div>
        <button type="submit" class="primary-button">Next</button>
      </div>
    </form>
    <section id="publicKeyBase58Section" class="hidden">
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
  `;

  connectedCallback() {
    const form = this.querySelector("form");

    if (!form) {
      throw new Error("No form found for selector: form");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formControls = form.elements as EnterSeedFormControls;

      const seedHex = formControls.seedHex.value;

      // If we're given the seed hex, we can skip the mnemonic, passphrase, and account number.
      if (seedHex) {
        const keys = keygen(seedHex);
        sharedState.privateKeyHex = seedHex;
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

      sharedState.privateKeyHex = keygen(keys.privateKey).seedHex;

      if (!keys.publicKey) {
        throw new Error("Problem generating key pair from seed.");
      }

      this.confirmPublicKey(keys.publicKey);
      return;
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

    const signTxForm = document.getElementById("signTxForm");

    if (!signTxForm) {
      throw new Error(
        "No sign transaction form found for selector: #signTxForm",
      );
    }

    signTxForm.classList.remove("hidden");
    signTxForm.scrollIntoView({
      behavior: "smooth",
    });
  }
}
