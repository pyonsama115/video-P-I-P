(() => {
  if (globalThis.__videoPipTopmostLoaded) {
    return;
  }
  globalThis.__videoPipTopmostLoaded = true;

  function isVisible(video) {
    const rect = video.getBoundingClientRect();
    const style = getComputedStyle(video);

    return (
      rect.width >= 120 &&
      rect.height >= 68 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) > 0
    );
  }

  function scoreVideo(video) {
    const rect = video.getBoundingClientRect();
    let score = rect.width * rect.height;

    if (!video.paused && !video.ended) {
      score += 10_000_000;
    }
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      score += 1_000_000;
    }
    if (isVisible(video)) {
      score += 500_000;
    }

    return score;
  }

  function findBestVideo() {
    return [...document.querySelectorAll("video")]
      .filter((video) => video.readyState !== HTMLMediaElement.HAVE_NOTHING)
      .sort((left, right) => scoreVideo(right) - scoreVideo(left))[0];
  }

  function showNotice(message, isError = false) {
    document.getElementById("__video-pip-topmost-notice")?.remove();

    const notice = document.createElement("div");
    notice.id = "__video-pip-topmost-notice";
    notice.textContent = message;
    Object.assign(notice.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "18px",
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "min(560px, calc(100vw - 32px))",
      padding: "12px 16px",
      border: `1px solid ${isError ? "#ff7a7a" : "#75d6a2"}`,
      borderRadius: "10px",
      background: isError ? "#3a1518" : "#112a20",
      color: "#ffffff",
      font: "600 14px/1.5 system-ui, sans-serif",
      boxShadow: "0 10px 30px rgba(0, 0, 0, .35)",
      pointerEvents: "none",
    });

    document.documentElement.append(notice);
    setTimeout(() => notice.remove(), 3500);
  }

  async function togglePictureInPicture() {
    try {
      if (!document.pictureInPictureEnabled) {
        throw new Error("このページではChromeのPiP機能が無効です。");
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showNotice("Picture-in-Pictureを終了しました。");
        return { ok: true, active: false, message: "PiPを終了しました。" };
      }

      const video = findBestVideo();
      if (!video) {
        throw new Error("動画を検出できません。動画を再生してから試してください。");
      }

      // サイト側が付けた抑止属性を解除してから、Chrome標準PiPを要求する。
      video.disablePictureInPicture = false;
      video.removeAttribute("disablepictureinpicture");

      await video.requestPictureInPicture();
      showNotice("PiPを開始しました。Chromeを最小化しても最前面に残ります。");

      return {
        ok: true,
        active: true,
        message: "PiPを開始しました。",
      };
    } catch (error) {
      const message =
        error?.name === "NotAllowedError"
          ? "PiPがChromeに拒否されました。動画を一度クリックして再生してから、もう一度実行してください。"
          : error?.message || "PiPを開始できませんでした。";

      showNotice(message, true);
      return { ok: false, active: false, message };
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "VIDEO_PIP_TOGGLE") {
      return undefined;
    }

    togglePictureInPicture().then(sendResponse);
    return true;
  });
})();
