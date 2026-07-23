const toggleButton = document.getElementById("toggle");
const status = document.getElementById("status");

toggleButton.addEventListener("click", async () => {
  toggleButton.disabled = true;
  status.textContent = "動画を確認しています…";
  delete status.dataset.error;
  delete status.dataset.success;

  try {
    const result = await chrome.runtime.sendMessage({
      type: "VIDEO_PIP_TOGGLE_ACTIVE_TAB",
    });

    if (!result?.ok) {
      throw new Error(result?.message || "PiPを開始できませんでした。");
    }

    status.textContent = result.message;
    status.dataset.success = "true";
  } catch (error) {
    status.textContent = error.message;
    status.dataset.error = "true";
  } finally {
    toggleButton.disabled = false;
  }
});
