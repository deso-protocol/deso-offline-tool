import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { keygen, publicKeyToBase58Check } from "deso-protocol";

interface EnterSeedFormControls extends HTMLFormControlsCollection {
  mnemonic: HTMLInputElement;
  passphrase: HTMLInputElement;
  seedHex: HTMLInputElement;
  accountNumber: HTMLInputElement;
}

export function initSignTab() {
  const publicKeySectionEl = document.getElementById("publicKeyBase58Section");
  const publicKeyEl = document.getElementById("publicKeyBase58Container");

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

  document
    .getElementById("enterSeedForm")
    ?.addEventListener("submit", function (event) {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formControls = form.elements as EnterSeedFormControls;

      const seedHex = formControls.seedHex.value;

      // If we're given the seed hex, we can skip the mnemonic, passphrase, and account number.
      if (seedHex) {
        const keys = keygen(seedHex);
        const publicKeyBase58Check = publicKeyToBase58Check(keys.public);

        publicKeyEl.textContent = publicKeyBase58Check;
        publicKeySectionEl.classList.remove("hidden");
        document.getElementById("signTxForm")?.classList.remove("hidden");
        return;
      }

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

      // TODO: figure out why this is not working for sub-accounts.
      // The public keys are not matching what we have in identity frontend.
      // The "0" account and passphrase works fine though...
      if (!keys.publicKey) {
        throw new Error("Problem generating key pair from seed.");
      }

      publicKeyEl.textContent = publicKeyToBase58Check(keys.publicKey);
      publicKeySectionEl.classList.remove("hidden");
      const signTxForm = document.getElementById("signTxForm");
      signTxForm?.classList.remove("hidden");
      signTxForm?.scrollIntoView({
        behavior: "smooth",
      });
    });
}
