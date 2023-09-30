import { NavButton } from "./components/nav-button";

const INITIAL_TAB_ID =
  window.localStorage?.getItem("initialTabId") ?? "generate-txn-tab";

export function initNav() {
  const activeTab = document.getElementById(INITIAL_TAB_ID);
  const activeButton = document.querySelector(`[to='${INITIAL_TAB_ID}']`);

  if (!activeTab) {
    throw new Error(`No active tab found for selector: #${INITIAL_TAB_ID}`);
  }

  if (!activeButton) {
    throw new Error(
      `No active button found for selector: [to='${INITIAL_TAB_ID}']`,
    );
  }

  activeTab.classList.remove("hidden");
  activeButton.classList.add("nav-button--active");

  window.history.replaceState(
    {
      tabId: INITIAL_TAB_ID,
    },
    "",
    `#${INITIAL_TAB_ID}`,
  );

  window.addEventListener("beforeunload", function () {
    const activeNavButton = document.querySelector(
      ".nav-button--active",
    ) as NavButton | null;

    if (activeNavButton?.to) {
      window.localStorage?.setItem("initialTabId", activeNavButton.to);
    }
  });

  window.addEventListener("popstate", function (event) {
    if (event.state.tabId) {
      const navButton = document.querySelector(
        `[to='${event.state.tabId}']`,
      ) as NavButton | null;
      navButton?.click();
    } else {
      throw new Error("Missing tabId in popstate event state");
    }
  });
}
