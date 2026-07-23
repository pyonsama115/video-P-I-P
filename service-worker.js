chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "OPEN_CHROME_SYSTEM_SETTINGS") {
    return undefined;
  }

  chrome.tabs
    .create({ url: "chrome://settings/system" })
    .then(() => sendResponse({ ok: true }))
    .catch((error) => {
      sendResponse({ ok: false, message: error.message });
    });

  return true;
});
