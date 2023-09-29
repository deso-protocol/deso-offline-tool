const INITIAL_TAB_ID =
  window.localStorage?.getItem("initialTabId") ?? "generate-txn-tab";

export function initNav() {
  let activeTab = document.getElementById(INITIAL_TAB_ID);
  let activeButton = document.querySelector(`[data-tab='${INITIAL_TAB_ID}']`);

  if (!activeTab) {
    throw new Error(`No active tab found for selector: #${INITIAL_TAB_ID}`);
  }

  if (!activeButton) {
    throw new Error(
      `No active button found for selector: [data-tab='${INITIAL_TAB_ID}']`,
    );
  }

  activeTab.classList.remove("hidden");
  activeButton.classList.add("nav-button--active");

  const navEl = document.getElementById("main-nav");

  if (!navEl) {
    throw new Error("No nav element found for selector: #main-nav");
  }

  navEl.addEventListener("click", function (event) {
    const clickedEl = event.target as HTMLElement | null;
    const tabId = clickedEl?.dataset.tab;

    if (!tabId || activeTab?.id === tabId) {
      // This could mean the user clicked on the nav bar itself, on a button
      // that doesn't have a tab associated with it, or on the currently active
      // tab. In any case, we don't want to do anything.
      return;
    }

    const clickedTabEl = document.getElementById(tabId);

    if (!clickedTabEl) {
      throw new Error(`No tab found for tab id ${tabId}`);
    }

    activeTab?.classList.add("hidden");
    activeButton?.classList.remove("nav-button--active");

    activeTab = clickedTabEl;
    activeButton = clickedEl;

    clickedTabEl.classList.remove("hidden");
    clickedEl.classList.add("nav-button--active");
  });

  window.addEventListener("beforeunload", function () {
    if (activeTab?.id) {
      window.localStorage?.setItem("initialTabId", activeTab?.id ?? "");
    }
  });
}
