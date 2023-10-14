import { addFormError, html } from "../utils";
import { BaseComponent } from "./base-component";
import {
  generateMnemonic,
  mnemonicToSeedSync,
  mnemonicToEntropy,
  entropyToMnemonic,
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { utils } from "@noble/secp256k1";
import { HDKey } from "@scure/bip32";
import { publicKeyToBase58Check } from "deso-protocol";

interface GenerateMnemonicFormControls extends HTMLFormControlsCollection {
  mnemonicPassphrase: HTMLInputElement;
  randomMnemonic: HTMLInputElement;
  randomEntropy: HTMLInputElement;
  desoPublicKey: HTMLInputElement;
}

export class GenerateMnemonic extends BaseComponent {
  innerHTML = html`
    <div>
      <button id="generateMnemonicButton" class="primary-button">
        Generate Random Mnemonic
      </button>
      <div id="mnemonicFields"></div>
    </div>
  `;

  connectedCallback() {
    this.querySelector("#generateMnemonicButton").addEventListener(
      "click",
      this.showForm,
    );
  }

  showForm = () => {
    this.querySelector("#mnemonicFields").outerHTML = html`
      <form id="generateMnemonicForm" class="mt-6">
        <div class="form-controls">
          <p class="secondary-text">
            The fields below were randomly generated, but you can edit them to
            use your own randomness to generate the DeSo seed phrase. You can
            also use a tool like
            <a
              class="inline-button"
              href="https://iancoleman.io/bip39"
              target="_blank"
              rel="noopener noreferrer"
              >Ian Coleman</a
            >
            to generate a mnemonic using dice rolls, and then enter that
            mnemonic here.
          </p>
          <input-group
            labelText="Entropy"
            inputId="randomEntropy"
          ></input-group>
          <input-group
            labelText="Mnemonic"
            inputId="randomMnemonic"
          ></input-group>
          <input-group
            labelText="Passphrase (optional)"
            inputId="mnemonicPassphrase"
          ></input-group>
          <input-group
            labelText="DeSo Public Key"
            disabled="true"
            inputId="desoPublicKey"
          ></input-group>
        </div>
      </form>
    `;
    this.onGenerateRandomMnemonic();
    this.querySelector("#generateMnemonicButton").addEventListener(
      "click",
      this.onGenerateRandomMnemonic,
    );
    this.querySelector("#generateMnemonicButton").removeEventListener(
      "click",
      this.showForm,
    );
  };

  onGenerateRandomMnemonic = () => {
    const form = this.querySelector("form") as HTMLFormElement;
    const formControls = form.elements as GenerateMnemonicFormControls;
    const mnemonic = generateMnemonic(wordlist);
    const passphrase = formControls.mnemonicPassphrase.value;
    const seed = mnemonicToSeedSync(mnemonic, passphrase);
    const hdkey = HDKey.fromMasterSeed(seed);
    const keys = hdkey.derive("m/44'/0'/0'/0/0");
    const entropy = mnemonicToEntropy(mnemonic, wordlist);

    formControls.randomMnemonic.value = mnemonic;
    formControls.randomEntropy.value = utils.bytesToHex(entropy);

    if (!keys.publicKey) {
      // TODO: UI error feedback. This has never happened in testing, but it's apparently possible.
      throw new Error("Public key could not be derived.");
    }

    formControls.desoPublicKey.value = publicKeyToBase58Check(keys.publicKey);

    form.querySelectorAll("[data-error-for]").forEach((el) => {
      el.textContent = "";
    });

    this.querySelector("#mnemonicPassphrase").addEventListener(
      "input",
      (event) => {
        const form = this.querySelector("form") as HTMLFormElement;
        const formControls = form.elements as GenerateMnemonicFormControls;
        const mnemonic = formControls.randomMnemonic.value;
        const passphrase = formControls.mnemonicPassphrase.value;
        const seed = mnemonicToSeedSync(mnemonic, passphrase);
        const hdkey = HDKey.fromMasterSeed(seed);
        const keys = hdkey.derive("m/44'/0'/0'/0/0");
        const entropy = mnemonicToEntropy(mnemonic, wordlist);

        formControls.randomMnemonic.value = mnemonic;
        formControls.randomEntropy.value = utils.bytesToHex(entropy);

        if (!keys.publicKey) {
          // TODO: UI error feedback
          throw new Error("Public key could not be derived.");
        }

        formControls.desoPublicKey.value = publicKeyToBase58Check(
          keys.publicKey,
        );
      },
    );

    this.querySelector("#randomEntropy").addEventListener("input", (event) => {
      try {
        const form = this.querySelector("form") as HTMLFormElement;
        const formControls = form.elements as GenerateMnemonicFormControls;
        const entropy = utils.hexToBytes(
          formControls.randomEntropy.value.trim(),
        );
        const passphrase = formControls.mnemonicPassphrase.value;
        const mnemonic = entropyToMnemonic(entropy, wordlist);
        const seed = mnemonicToSeedSync(mnemonic, passphrase);
        const hdkey = HDKey.fromMasterSeed(seed);
        const keys = hdkey.derive("m/44'/0'/0'/0/0");

        formControls.randomMnemonic.value = mnemonic;
        formControls.randomEntropy.value = utils.bytesToHex(entropy);

        if (!keys.publicKey) {
          // TODO: UI error feedback
          throw new Error("Public key could not be derived.");
        }

        formControls.desoPublicKey.value = publicKeyToBase58Check(
          keys.publicKey,
        );
      } catch (e) {
        formControls.randomMnemonic.value = "";
        formControls.desoPublicKey.value = "";
        addFormError("randomEntropy", String(e));
      }
    });

    this.querySelector("#randomMnemonic").addEventListener("input", (event) => {
      try {
        const form = this.querySelector("form") as HTMLFormElement;
        const formControls = form.elements as GenerateMnemonicFormControls;
        const mnemonic = formControls.randomMnemonic.value;
        const passphrase = formControls.mnemonicPassphrase.value;
        const entropy = mnemonicToEntropy(mnemonic, wordlist);
        const seed = mnemonicToSeedSync(mnemonic, passphrase);
        const hdkey = HDKey.fromMasterSeed(seed);
        const keys = hdkey.derive("m/44'/0'/0'/0/0");

        formControls.randomMnemonic.value = mnemonic;
        formControls.randomEntropy.value = utils.bytesToHex(entropy);

        if (!keys.publicKey) {
          // TODO: UI error feedback
          throw new Error("Public key could not be derived.");
        }

        formControls.desoPublicKey.value = publicKeyToBase58Check(
          keys.publicKey,
        );
      } catch (e) {
        formControls.randomEntropy.value = "";
        formControls.desoPublicKey.value = "";
        addFormError("randomMnemonic", "Error: Invalid mnemonic phrase.");
      }
    });
  };
}
