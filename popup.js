const settingsButton = document.getElementById("open-system-settings");
const settingsResult = document.getElementById("settings-result");

settingsButton.addEventListener("click", async () => {
  settingsButton.disabled = true;
  settingsResult.textContent = "";

  try {
    const response = await chrome.runtime.sendMessage({
      type: "OPEN_CHROME_SYSTEM_SETTINGS",
    });

    if (!response?.ok) {
      throw new Error(response?.message || "設定を開けませんでした。");
    }

    settingsResult.textContent = "設定ページを開きました。";
  } catch {
    settingsResult.textContent =
      "アドレス欄に chrome://settings/system を貼り付けてください。";
  } finally {
    settingsButton.disabled = false;
  }
});
