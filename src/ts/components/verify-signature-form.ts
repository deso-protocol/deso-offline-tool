import { verify } from "@noble/secp256k1";
import { bs58PublicKeyToBytes } from "deso-protocol";
import { html, plainTextToHashHex } from "../utils";
import { BaseComponent } from "./base-component";

interface VerifySignatureFormControls extends HTMLFormControlsCollection {
  msgToVerify: HTMLTextAreaElement;
  signingPublicKey: HTMLInputElement;
  msgSignature: HTMLTextAreaElement;
}

export class VerifySignatureForm extends BaseComponent {
  innerHTML = html`
    <form>
      <section class="form-controls">
        <input-group
          inputId="msgToVerify"
          labelText="Message Text"
          isTextArea="true"
          required="true"
        ></input-group>
        <input-group
          inputId="signingPublicKey"
          labelText="Public Key"
          hintText="The public key of the key pair that signed the message."
          required="true"
        ></input-group>
        <input-group
          inputId="msgSignature"
          labelText="Message Signature"
          isTextArea="true"
          required="true"
        ></input-group>
      </section>
      <div class="flex items-center">
        <button type="submit" class="primary-button mr-3">Verify</button>
        <p id="verifyResultSuccess" class="text-green-400 hidden">
          <svg-icon icon="check-circle"></svg-icon> Valid signature.
        </p>
        <p id="verifyResultError" class="text-red-400 hidden">
          <svg-icon icon="x-circle"></svg-icon> Invalid signature.
        </p>
      </div>
    </form>
  `;

  connectedCallback() {
    this.rehydratePage();
    const form = this.querySelector("form");
    const verifyResultSuccessEl = this.querySelector("#verifyResultSuccess");
    const verifyResultErrorEl = this.querySelector("#verifyResultError");

    form.addEventListener("input", () => {
      // clear the result messages any time the form changes.
      verifyResultSuccessEl.classList.add("hidden");
      verifyResultErrorEl.classList.add("hidden");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      // TODO: form validation
      const formControls = (form as HTMLFormElement)
        .elements as VerifySignatureFormControls;
      const msgText = formControls.msgToVerify.value;
      const publicKey = formControls.signingPublicKey.value;
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

    window.addEventListener("beforeunload", () => {
      const msgToVerifyInput = this.querySelector(
        "#msgToVerify",
      ) as HTMLTextAreaElement | null;
      const signingPublicKeyInput = this.querySelector(
        "#signingPublicKey",
      ) as HTMLInputElement | null;
      const msgSignatureInput = this.querySelector(
        "#msgSignature",
      ) as HTMLInputElement | null;

      window.localStorage?.setItem(
        "verifyFormState",
        JSON.stringify({
          msgToVerify: msgToVerifyInput?.value ?? "",
          signingPublicKey: signingPublicKeyInput?.value ?? "",
          msgSignature: msgSignatureInput?.value ?? "",
        }),
      );
    });
  }

  rehydratePage() {
    const verifyFormStateJSON = window.localStorage?.getItem("verifyFormState");
    if (verifyFormStateJSON) {
      const { msgToVerify, signingPublicKey, msgSignature } =
        JSON.parse(verifyFormStateJSON);

      const msgToVerifyInput = this.querySelector(
        "#msgToVerify",
      ) as HTMLTextAreaElement;
      const signingPublicKeyInput = this.querySelector(
        "#signingPublicKey",
      ) as HTMLInputElement;
      const msgSignatureInput = this.querySelector(
        "#msgSignature",
      ) as HTMLInputElement;

      msgToVerifyInput.value = msgToVerify;
      signingPublicKeyInput.value = signingPublicKey;
      msgSignatureInput.value = msgSignature;
    }
  }
}
