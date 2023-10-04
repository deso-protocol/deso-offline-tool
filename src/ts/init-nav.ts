export function initNav() {
  if (!window.location.hash) {
    // If the page is loaded without a hash, default to the generate tab.
    window.location.hash = "#generate";
  } else if (
    window.location.hash === window.localStorage.getItem("lastHashLocation")
  ) {
    // If the page is reloaded on a hash, update the active tab to match the hash.
    updateActiveTab();
  }

  window.addEventListener("hashchange", function (event) {
    updateActiveTab();
  });

  window.addEventListener("beforeunload", () => {
    window.localStorage.setItem("lastHashLocation", window.location.hash);
  });
}

function updateActiveTab() {
  const nav = document.querySelector("#main-nav");

  if (!nav) {
    throw new Error("No nav element found for selector: #main-nav");
  }

  const activeNavButton = nav.querySelector(".active");

  if (activeNavButton) {
    activeNavButton.classList.remove("active");
    const activeTabId = activeNavButton.getAttribute("href") ?? "";
    const activeTab = document.querySelector(activeTabId);

    if (!activeTab) {
      throw new Error(`No tab found with id: #${activeTabId}`);
    }

    activeTab.classList.add("hidden");
  }

  const newTabId = window.location.hash;
  const newTab = document.querySelector(newTabId);

  if (!newTab) {
    throw new Error(`No tab found for selector: ${newTabId}`);
  }

  const newNavButton = nav.querySelector(`[href='${newTabId}']`);

  if (!newNavButton) {
    throw new Error(`No nav button found for selector: [href='${newTabId}']`);
  }

  newNavButton.classList.add("active");
  newTab.classList.remove("hidden");

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 1);
}
