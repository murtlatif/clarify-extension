const MESSAGE_ENABLE = "__CLARIFY_OBSERVER_ENABLE";
const MESSAGE_DISABLE = "__CLARIFY_OBSERVER_DISABLE";

let observer;

const updateResourceHref = (resource) => {
  const decodedHref = decodeURIComponent(resource.href);
  const url = new URL(decodedHref);
  const urlQuery = url.searchParams.get("url");
  console.log(`Updating resource from ${resource.href} to ${urlQuery}`);
  resource.href = urlQuery;
};

const initializeObserver = () => {
  const clarityObserver = new MutationObserver((mutationsList) => {
    const iframe = document.querySelector("iframe");
    let resources = iframe.contentDocument.querySelectorAll(
      'link[href*="https://clarity.microsoft.com/external/v2/resources"]'
    );
    console.log({ iframe, cd: iframe.contentDocument, resources });
    for (let resource of resources) {
      updateResourceHref(resource);
    }
  });

  if (typeof observer !== "undefined") {
    observer?.disconnect();
  }
  observer = clarityObserver;
  console.log("Observer can now observate");
};

const setObserving = (observing) => {
  console.log("Observer is now...", observing ? "ON" : "OFF");
  if (observing) {
    observer?.observe(document, {
      childList: true,
      subtree: true,
    });
  } else {
    observer?.disconnect();
  }
};

initializeObserver();
console.log("Initialized observer.");
console.log("Adding message listener...");
browser.runtime.onMessage.addListener((message) => {
  if (message === MESSAGE_ENABLE) {
    setObserving(true);
  } else if (message === MESSAGE_DISABLE) {
    setObserving(false);
  }
});
