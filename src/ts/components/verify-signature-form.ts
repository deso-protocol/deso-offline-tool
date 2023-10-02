import { verify } from "@noble/secp256k1";
import { bs58PublicKeyToBytes } from "deso-protocol";
import { html, plainTextToHashHex } from "../utils";

interface VerifySignatureFormControls extends HTMLFormControlsCollection {
  msgToVerify: HTMLInputElement;
  publicKey: HTMLInputElement;
  msgSignature: HTMLInputElement;
}

export class VerifySignatureForm extends HTMLElement {
  innerHTML = html`
    <form>
      <section class="form-controls">
        <input-group
          inputId="msgToVerify"
          labelText="Message Text"
          isTextArea="true"
        ></input-group>
        <input-group
          inputId="publicKey"
          labelText="Public Key"
          hintText="The public key of the key pair that signed the message."
        ></input-group>
        <input-group
          inputId="msgSignature"
          labelText="Message Signature"
          isTextArea="true"
        ></input-group>
      </section>
      <div>
        <button type="submit" class="primary-button">Verify</button>
      </div>
      <div class="mt-3 h-10">
        <p id="verifyResultSuccess" class="text-green-400 hidden">
          <svg-icon icon="check-circle"></svg-icon> The signature is valid.
        </p>
        <p id="verifyResultError" class="text-red-400 hidden">
          <svg-icon icon="x-circle"></svg-icon> The signature is invalid.
        </p>
      </div>
    </form>
  `;

  connectedCallback() {
    const form = this.querySelector("form");
    const verifyResultSuccessEl = this.querySelector("#verifyResultSuccess");
    const verifyResultErrorEl = this.querySelector("#verifyResultError");

    if (!form) {
      throw new Error("No form found for selector: form");
    }

    if (!verifyResultSuccessEl) {
      throw new Error(
        "No verify result element found for selector: #verifyResultSuccess",
      );
    }

    if (!verifyResultErrorEl) {
      throw new Error(
        "No verify result element found for selector: #verifyResultError",
      );
    }

    form.addEventListener("input", () => {
      // clear the result messages any time the from changes.
      verifyResultSuccessEl?.classList.add("hidden");
      verifyResultErrorEl?.classList.add("hidden");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formControls = (form as HTMLFormElement)
        .elements as VerifySignatureFormControls;
      const msgText = formControls.msgToVerify.value;
      const publicKey = formControls.publicKey.value;
      const msgSignature = formControls.msgSignature.value;
      const messageHashHex = plainTextToHashHex(msgText);
      const publicKeyBytes = bs58PublicKeyToBytes(publicKey);
      const isValid = verify(msgSignature, messageHashHex, publicKeyBytes);

      const verifyResultSuccessEl = this.querySelector("#verifyResultSuccess");
      const verifyResultErrorEl = this.querySelector("#verifyResultError");

      if (isValid) {
        verifyResultSuccessEl?.classList.remove("hidden");
        verifyResultErrorEl?.classList.add("hidden");
      } else {
        verifyResultErrorEl?.classList.remove("hidden");
        verifyResultSuccessEl?.classList.add("hidden");
      }
    });
  }
}
