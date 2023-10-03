import { escapeHTML, html } from "../utils";

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
          required="true"
        ></input-group>
      </section>
      <div>
        <button type="submit" class="primary-button mr-3">Broadcast</button>
        <div class="mt-4 secondary-text">
          <p id="broadcastSuccess" class="hidden">
            <span class="text-green-400"
              ><svg-icon icon="check-circle"></svg-icon>Your transaction was
              successfully broadcasted to the network. View it on the</span
            >
            <a
              id="explorerLink"
              class="inline-button"
              target="_blank"
              href="https://explorer-staging.deso.com"
              >DeSo explorer
              <svg-icon
                icon="external-link"
                class="relative top-[-2px]"
              ></svg-icon
            ></a>
          </p>
          <p id="broadcastError" class="text-red-400 hidden">
            <svg-icon icon="x-circle"></svg-icon>
            <span id="broadcastErrorMessage"></span>
          </p>
        </div>
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

    form.addEventListener("input", () => {
      this.querySelector("#broadcastSuccess")?.classList.add("hidden");
      this.querySelector("#broadcastError")?.classList.add("hidden");
    });

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
          return response.json();
        } else {
          return response.json().then((error) => {
            throw new Error(error.error);
          });
        }
      })
      .then(({ TxnHashHex }) => {
        // TODO: update to prod link when available
        const explorerLink = `https://explorer-staging.deso.com/txn/${escapeHTML(
          TxnHashHex,
        )}`;
        const broadcastSuccessEl = this.querySelector("#broadcastSuccess");
        const explorerLinkEl = this.querySelector("#explorerLink");
        const broadcastErrorEl = this.querySelector("#broadcastError");

        broadcastErrorEl?.classList.add("hidden");

        if (!broadcastSuccessEl) {
          throw new Error(
            "No broadcast success element found for selector: #broadcastSuccess",
          );
        }

        if (!explorerLinkEl) {
          throw new Error(
            "No explorer link element found for selector: #explorerLink",
          );
        }

        explorerLinkEl.setAttribute("href", explorerLink);
        broadcastSuccessEl.classList.remove("hidden");
      })
      .catch((error) => {
        this.querySelector("#broadcastSuccess")?.classList.add("hidden");

        const broadcastErrorEl = this.querySelector("#broadcastError");
        const broadcastErrorMessageEl = this.querySelector(
          "#broadcastErrorMessage",
        );

        if (!broadcastErrorEl) {
          throw new Error(
            "No broadcast error element found for selector: #broadcastError",
          );
        }

        if (!broadcastErrorMessageEl) {
          throw new Error(
            "No broadcast error message element found for selector: #broadcastErrorMessage",
          );
        }

        broadcastErrorMessageEl.textContent = error.message;
        broadcastErrorEl.classList.remove("hidden");
      });
  }
}
