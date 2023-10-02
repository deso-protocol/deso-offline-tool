import { html } from "../utils";

interface BroadcastFormControls extends HTMLFormControlsCollection {
  signedTxHex: HTMLTextAreaElement;
}

export class BroadcastForm extends HTMLElement {
  innerHTML = html`
    <form>
      <section class="form-controls">
        <input-group
          inputId="signedTxHex"
          labelText="Signed Transaction Hex"
          isTextArea="true"
        ></input-group>
      </section>
      <div class="flex items-center">
        <button type="submit" class="primary-button mr-3">Broadcast</button>
        <p id="verifyResultSuccess" class="text-green-400 hidden">
          <svg-icon icon="check-circle"></svg-icon> The signature is valid.
        </p>
        <p id="verifyResultError" class="text-red-400 hidden">
          <svg-icon icon="x-circle"></svg-icon> The signature is invalid.
        </p>
      </div>
    </form>
  `;

  constructor() {
    super();
    this.style.display = "block";
  }

  connectedCallback() {
    const form = this.querySelector("form");

    if (!form) {
      throw new Error("No form found for selector: form");
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formControls = (form as HTMLFormElement)
        .elements as BroadcastFormControls;
      const txnHex = formControls.signedTxHex.value;

      // TODO: form validation

      this.broadcast(txnHex);
    });
  }

  broadcast(txnHex: string) {
    fetch("https://node.deso.org/api/v0/submit-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        TransactionHex: txnHex,
      }),
    })
      .then((response) => {
        if (response.ok) {
          // TODO: add link to deso explorer thing
          console.log("Transaction broadcasted successfully.");
          return response.json();
        } else {
          throw new Error("Transaction broadcast failed.");
        }
      })
      .then((json) => {
        console.log("response", json);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
