const SUPPORTED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "www.netflix.com",
  "netflix.com",
]);

function isSupportedUrl(rawUrl = "") {
  try {
    return SUPPORTED_HOSTS.has(new URL(rawUrl).hostname);
  } catch {
    return false;
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
}

async function sendToggle(tab) {
  if (!tab?.id) {
    return { ok: false, message: "操作するタブが見つかりません。" };
  }

  if (!isSupportedUrl(tab.url)) {
    return {
      ok: false,
      message: "YouTube または Netflix の動画ページで実行してください。",
    };
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, {
      type: "VIDEO_PIP_TOGGLE",
    });
  } catch {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      return await chrome.tabs.sendMessage(tab.id, {
        type: "VIDEO_PIP_TOGGLE",
      });
    } catch (error) {
      return {
        ok: false,
        message: `ページを再読み込みして、もう一度試してください。 (${error.message})`,
      };
    }
  }
}

async function toggleActiveTab() {
  return sendToggle(await getActiveTab());
}

chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-picture-in-picture") {
    return;
  }

  toggleActiveTab().catch(() => {
    // ショートカット操作では、詳細エラーはページ上の通知に任せる。
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "VIDEO_PIP_TOGGLE_ACTIVE_TAB") {
    return undefined;
  }

  toggleActiveTab()
    .then(sendResponse)
    .catch((error) => {
      sendResponse({ ok: false, message: error.message });
    });

  return true;
});
