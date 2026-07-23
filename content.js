(() => {
  if (globalThis.__videoPipTopmostLoaded) {
    return;
  }
  globalThis.__videoPipTopmostLoaded = true;

  const CONTROL_ID = "__video-pip-topmost-control";
  const NOTICE_ID = "__video-pip-topmost-notice";
  const STYLE_ID = "__video-pip-topmost-style";
  const isYouTube = /(^|\.)youtube\.com$|^youtu\.be$/.test(location.hostname);
  const isNetflix = /(^|\.)netflix\.com$/.test(location.hostname);

  const PIP_ICON = `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M19 7H5v10h6v2H3V5h18v7h-2V7Zm4 8v8H13v-8h10Zm-2 2h-6v4h6v-4Z"></path>
    </svg>
  `;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${CONTROL_ID} svg {
        display: block;
        width: 100%;
        height: 100%;
        fill: currentColor;
        pointer-events: none;
      }

      .video-pip-topmost-youtube {
        display: inline-block !important;
        width: 48px !important;
        height: 48px !important;
        padding: 11px !important;
        color: #fff !important;
        opacity: .9;
      }

      .video-pip-topmost-youtube:hover {
        opacity: 1;
      }

      .video-pip-topmost-netflix {
        position: absolute;
        right: 72px;
        bottom: 18px;
        z-index: 50;
        width: 48px;
        height: 48px;
        padding: 10px;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: #fff;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .85));
        transition: opacity 160ms ease, transform 120ms ease;
      }

      .video-pip-topmost-netflix[data-visible="true"],
      .video-pip-topmost-netflix:focus-visible {
        opacity: 1;
        pointer-events: auto;
      }

      .video-pip-topmost-netflix:hover {
        transform: scale(1.12);
      }

      .video-pip-topmost-netflix:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
      }

      #${NOTICE_ID} {
        position: fixed;
        z-index: 2147483647;
        top: 18px;
        left: 50%;
        max-width: min(620px, calc(100vw - 32px));
        padding: 12px 16px;
        transform: translateX(-50%);
        border: 1px solid #75d6a2;
        border-radius: 10px;
        background: #112a20;
        color: #fff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, .35);
        font: 600 14px/1.5 system-ui, sans-serif;
        pointer-events: none;
      }

      #${NOTICE_ID}[data-error="true"] {
        border-color: #ff7a7a;
        background: #3a1518;
      }
    `;
    (document.head || document.documentElement).append(style);
  }

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
    document.getElementById(NOTICE_ID)?.remove();

    const notice = document.createElement("div");
    notice.id = NOTICE_ID;
    notice.dataset.error = String(isError);
    notice.textContent = message;
    document.documentElement.append(notice);
    setTimeout(() => notice.remove(), isError ? 6500 : 3500);
  }

  async function togglePictureInPicture() {
    try {
      if (!document.pictureInPictureEnabled) {
        throw new Error("このページではChromeのPiP機能が無効です。");
      }

      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showNotice("Picture-in-Pictureを終了しました。");
        return;
      }

      const video = findBestVideo();
      if (!video) {
        throw new Error(
          "動画を検出できません。動画を再生してから、もう一度押してください。",
        );
      }

      video.disablePictureInPicture = false;
      video.removeAttribute("disablepictureinpicture");
      await video.requestPictureInPicture();
      showNotice(
        "PiPを開始しました。映像が止まる場合は拡張機能アイコンの「トラブル対処」を確認してください。",
      );
    } catch (error) {
      const message =
        error?.name === "NotAllowedError"
          ? "PiPがChromeに拒否されました。動画を一度クリックして再生し、再生バー内のPiPボタンを直接押してください。"
          : error?.message || "PiPを開始できませんでした。";

      showNotice(message, true);
    }
  }

  function prepareButton(button, className) {
    button.id = CONTROL_ID;
    button.type = "button";
    button.className = className;
    button.title = "ピクチャー イン ピクチャー";
    button.setAttribute("aria-label", "Picture-in-Pictureを開始・終了");
    button.setAttribute("data-title-no-tooltip", "ピクチャー イン ピクチャー");
    button.innerHTML = PIP_ICON;

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        togglePictureInPicture();
      },
      true,
    );

    return button;
  }

  function installYouTubeControl() {
    const existing = document.getElementById(CONTROL_ID);
    if (existing?.closest(".ytp-right-controls")) {
      return true;
    }
    existing?.remove();

    const rightControls =
      document.querySelector(".ytp-right-controls-right") ||
      document.querySelector(".ytp-right-controls");
    if (!rightControls) {
      return false;
    }

    const nativePipButton = document.querySelector(
      ".ytp-pip-button:not([data-video-pip-topmost-ready])",
    );
    const button = nativePipButton || document.createElement("button");
    button.dataset.videoPipTopmostReady = "true";
    prepareButton(
      button,
      `${button.className || ""} ytp-button video-pip-topmost-youtube`.trim(),
    );

    const theaterButton = rightControls.querySelector(".ytp-size-button");
    rightControls.insertBefore(button, theaterButton || rightControls.firstChild);
    return true;
  }

  function installNetflixControl() {
    const player = document.querySelector('[data-uia="player"]');
    if (!player) {
      return false;
    }

    const existing = document.getElementById(CONTROL_ID);
    if (existing?.parentElement === player) {
      return true;
    }
    existing?.remove();

    const button = prepareButton(
      document.createElement("button"),
      "video-pip-topmost-netflix",
    );
    player.append(button);

    let hideTimer;
    const revealWithControls = () => {
      button.dataset.visible = "true";
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (document.activeElement !== button) {
          button.dataset.visible = "false";
        }
      }, 2800);
    };

    player.addEventListener("pointermove", revealWithControls, {
      passive: true,
    });
    player.addEventListener("pointerdown", revealWithControls, {
      passive: true,
    });
    button.addEventListener("focus", revealWithControls);
    revealWithControls();
    return true;
  }

  function installPageControl() {
    installStyles();
    if (isYouTube) {
      return installYouTubeControl();
    }
    if (isNetflix) {
      return installNetflixControl();
    }
    return false;
  }

  function isPipShortcut(event) {
    const windowsShortcut =
      event.altKey && event.shiftKey && event.code === "KeyP";
    const macShortcut =
      event.metaKey && event.shiftKey && event.code === "KeyP";
    return windowsShortcut || macShortcut;
  }

  window.addEventListener(
    "keydown",
    (event) => {
      if (!isPipShortcut(event)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      togglePictureInPicture();
    },
    true,
  );

  let installTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(installTimer);
    installTimer = setTimeout(installPageControl, 200);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  installPageControl();
})();
