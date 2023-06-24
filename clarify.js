const BADGE_TEXT_ON = "On";
const BADGE_COLOR_ON = "green";
const BADGE_TEXT_OFF = "Off";
const BADGE_COLOR_OFF = "red";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];
const MESSAGE_ENABLE = "__CLARIFY_OBSERVER_ENABLE";
const MESSAGE_DISABLE = "__CLARIFY_OBSERVER_DISABLE";
const VALID_URL = "https://clarity.microsoft.com/";

let observerEnabled = false;
let initialized = false;

const setBadgeText = (enabled, tabId) => {
  browser.action.setBadgeText({
    tabId,
    text: enabled ? BADGE_TEXT_ON : BADGE_TEXT_OFF,
  });
  browser.action.setBadgeBackgroundColor({
    tabId,
    color: enabled ? BADGE_COLOR_ON : BADGE_COLOR_OFF,
  });
};

const errorBadgeText = (tabId) => {
  browser.action.setBadgeText({
    tabId,
    text: "Error",
  });
  browser.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR_OFF });
};

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
Argument url must be a valid URL string.
*/
function protocolIsApplicable(url) {
  if (!url) return false;
  const protocol = new URL(url).protocol;
  return APPLICABLE_PROTOCOLS.includes(protocol);
}

const toggleObserver = (tab) => {
  if (protocolIsApplicable(tab.url)) {
    if (!observerEnabled) {
      enableObserver(tab);
    } else {
      disableObserver(tab);
    }
  }
};

const enableObserver = (tab) => {
  browser.tabs.sendMessage(tab.id, MESSAGE_ENABLE).then((val) => {
    setBadgeText(true, tab.id);
    observerEnabled = true;
  });
};

const disableObserver = (tab) => {
  browser.tabs.sendMessage(tab.id, MESSAGE_DISABLE).then(() => {
    setBadgeText(false, tab.id);
    observerEnabled = false;
  });
};

const initializeTab = (tab) => {
  console.log("Initializing tab", tab);

  if (tab.url?.startsWith(VALID_URL)) {
    console.log("Tab initialized!", tab);
    browser.action.setBadgeText({ tabId: tab.id, text: "Init" });
    browser.action.setBadgeBackgroundColor({ tabId: tab.id, color: "yellow" });
  }
};

browser.tabs.query({}).then((tabs) => {
  for (let tab of tabs) {
    initializeTab(tab);
  }
});

browser.tabs.onUpdated.addListener((tab) => {
  initializeTab(tab);
});

browser.action.onClicked.addListener((tab) => {
  if (!initialized) {
    initialized = true;
    setBadgeText(false, tab.id);
  }
  toggleObserver(tab);
});
