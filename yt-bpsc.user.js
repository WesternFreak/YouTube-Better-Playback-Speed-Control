// ==UserScript==
// @name         YouTube - Better Playback Speed Control
// @version      1.2.0
// @namespace    https://github.com/WesternFreak/YouTube-Better-Playback-Speed-Control
// @description  Customizable keyboard shortcuts to increase, decrease and reset playback rate, while also displaying relevant information directly in the video player.
// @icon         https://raw.githubusercontent.com/WesternFreak/YouTube-Better-Playback-Speed-Control/main/img/icon.png
// @author       WesternFreak
// @homepage     https://github.com/WesternFreak/YouTube-Better-Playback-Speed-Control
// @updateURL    https://github.com/WesternFreak/YouTube-Better-Playback-Speed-Control/raw/main/yt-bpsc.user.js
// @downloadURL  https://github.com/WesternFreak/YouTube-Better-Playback-Speed-Control/raw/main/yt-bpsc.user.js
// @supportURL   https://github.com/WesternFreak/YouTube-Better-Playback-Speed-Control/issues
// @match        https://www.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @license      MIT License
// ==/UserScript==

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  const PLAYBACK_RATE_DEFAULT = 1.0;
  const MIN_PLAYBACK_RATE = 0.25;
  const MAX_PLAYBACK_RATE = 5.0;
  const SYNC_THRESHOLD = 10; // seconds behind live before the "behind" text appears
  const POPUP_VERTICAL_DIVISOR = 7.5; // popup sits at videoHeight / this value from the top
  const POPUP_VISIBLE_MS = 500;
  const POPUP_FADE_MS = 500; // must match the CSS transition duration below
  const DISPLAY_UPDATE_INTERVAL_MS = 250;
  const OBSERVER_DEBOUNCE_MS = 150;
  const KEEP_RATE_GUARD_MS = 3000; // window after a video change in which YouTube's reset is undone
  const VIDEO_SELECTOR = "video.html5-main-video";

  // Speeds with their own optional direct shortcut
  const PRESET_RATES = [1.25, 1.5, 2.0];

  const DEFAULT_SETTINGS = {
    rateIncreaseKey: "NumpadAdd",
    rateDecreaseKey: "NumpadSubtract",
    rateResetKey: "", // optional
    rateStep: 0.25,
    toggleKey: "", // optional
    keepSpeed: false,
    presetKeys: PRESET_RATES.map(() => ""), // optional
  };

  // Storage keys match earlier versions so existing user settings still load.
  const STORAGE_KEYS = {
    rateIncreaseKey: "speedIncreaseKey",
    rateDecreaseKey: "speedDecreaseKey",
    rateResetKey: "speedResetKey",
    rateStep: "rateStep",
    toggleKey: "toggleRateKey",
    keepSpeed: "keepSpeedBetweenVideos",
  };

  const presetStorageKey = (index) => `speedPreset${index}Key`;

  const COLORS = {
    textPrimary: "#eee",
    textSecondary: "#ccc",
    backgroundPrimary: "#333",
    backgroundSecondary: "#444",
    backgroundOverlay: "rgba(0, 0, 0, 0.45)",
    buttonNeutral: "#1e90ff",
    buttonPositive: "#28a745",
    buttonNegative: "#dc3545",
  };

  const STYLES = {
    bpscTextDisplay: {
      marginLeft: "5px",
      fontSize: "12px",
      verticalAlign: "top",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.35)",
    },
    bpscConfigTitle: {
      color: COLORS.textPrimary,
      marginBottom: "20px",
      textAlign: "center",
    },
    bpscConfigContainer: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: "1000",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      color: COLORS.textSecondary,
    },
    bpscConfigContent: {
      backgroundColor: COLORS.backgroundPrimary,
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
      maxWidth: "350px",
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto",
      boxSizing: "border-box",
    },
    bpscConfigOverlay: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      zIndex: "1000",
    },
    bpscConfigInput: {
      padding: "8px",
      boxSizing: "border-box",
      border: "1px solid #555",
      borderRadius: "4px",
      flex: "2",
      marginRight: "10px",
      width: "240px",
      backgroundColor: COLORS.backgroundSecondary,
      color: COLORS.textSecondary,
    },
    bpscConfigInputLabel: {
      flex: "1",
      marginBottom: "5px",
      width: "120px",
      color: COLORS.textPrimary,
    },
    bpscConfigButton: {
      padding: "10px 15px",
      color: COLORS.textPrimary,
      border: "none",
      borderRadius: "5px",
      marginRight: "5px",
      marginLeft: "5px",
      cursor: "pointer",
      backgroundColor: COLORS.buttonNeutral,
      transition: "background-color 0.3s ease",
    },
    bpscConfigButtonSet: {
      padding: "5px 10px",
      cursor: "pointer",
      backgroundColor: "#008CBA",
      color: "#fff",
      border: "none",
      borderRadius: "3px",
    },
    bpscConfigButtonSave: {
      backgroundColor: COLORS.buttonPositive,
    },
    bpscConfigButtonCancel: {
      backgroundColor: COLORS.buttonNegative,
    },
    bpscVideoPopup: {
      position: "fixed",
      transform: "translate(-50%, -50%)",
      backgroundColor: COLORS.backgroundOverlay,
      color: COLORS.textPrimary,
      padding: "10px 20px",
      borderRadius: "5px",
      zIndex: "9999",
      fontFamily: "Arial, sans-serif",
      fontSize: "large",
      opacity: "1",
      transition: `opacity ${POPUP_FADE_MS}ms ease`,
    },
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const getStoredSettings = () => {
    const step = Number(
      GM_getValue(STORAGE_KEYS.rateStep, DEFAULT_SETTINGS.rateStep),
    );
    return {
      rateIncreaseKey: GM_getValue(
        STORAGE_KEYS.rateIncreaseKey,
        DEFAULT_SETTINGS.rateIncreaseKey,
      ),
      rateDecreaseKey: GM_getValue(
        STORAGE_KEYS.rateDecreaseKey,
        DEFAULT_SETTINGS.rateDecreaseKey,
      ),
      rateResetKey: GM_getValue(
        STORAGE_KEYS.rateResetKey,
        DEFAULT_SETTINGS.rateResetKey,
      ),
      rateStep:
        Number.isFinite(step) && step > 0 ? step : DEFAULT_SETTINGS.rateStep,
      toggleKey: GM_getValue(
        STORAGE_KEYS.toggleKey,
        DEFAULT_SETTINGS.toggleKey,
      ),
      keepSpeed: Boolean(
        GM_getValue(STORAGE_KEYS.keepSpeed, DEFAULT_SETTINGS.keepSpeed),
      ),
      presetKeys: PRESET_RATES.map((_, i) =>
        GM_getValue(presetStorageKey(i), ""),
      ),
    };
  };

  let storedExtensionSettings = getStoredSettings();
  let currentPlaybackRate = PLAYBACK_RATE_DEFAULT;
  let lastCustomRate = null; // last non-1x rate, used by the toggle key
  let keepRateTarget = null; // rate to restore if YouTube resets it right after a video change
  let keepRateUntil = 0;
  let lastVideoId = null;
  let additionalText = null; // the on-screen time/rate span
  let displayIntervalId = null;
  let checkScheduled = false;
  let activeCapture = null; // keybind capture in progress, if any

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const getVideo = () => document.querySelector(VIDEO_SELECTOR);

  // Fullscreen only renders the fullscreen element and its children,
  // so floating UI has to be attached there while fullscreen is active.
  const getOverlayRoot = () => document.fullscreenElement || document.body;

  // Avoid floating-point drift such as 1.0 + 0.1 + 0.1 = 1.2000000000000002
  const roundRate = (rate) => Math.round(rate * 1000) / 1000;

  // format time as [HH:]MM:SS
  const formatTime = (time) => {
    const safe = Number.isFinite(time) && time > 0 ? time : 0;
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = Math.floor(safe % 60);

    const formattedHours =
      hours > 0 ? hours.toString().padStart(2, "0") + ":" : "";
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
  };

  const getVideoIdFromUrl = () =>
    new URLSearchParams(window.location.search).get("v");

  // Set the rate through YouTube's player API as well as the <video> element.
  // YouTube keeps its own rate state; if we only set the element, its native
  // speed keybinds start from the stale value instead of ours.
  const setPlaybackRate = (rate) => {
    const player = document.querySelector(".html5-video-player");
    if (player && typeof player.setPlaybackRate === "function") {
      try {
        player.setPlaybackRate(rate);
      } catch (err) {
        console.warn("BPSC: player.setPlaybackRate failed", err);
      }
    }

    const video = getVideo();
    if (video && Math.abs(video.playbackRate - rate) > 0.001) {
      video.playbackRate = rate;
    }
  };

  // ---------------------------------------------------------------------------
  // Playback rate control
  // ---------------------------------------------------------------------------

  // Briefly show the new rate in the middle of the video
  const showPopup = (message) => {
    const video = getVideo();
    if (!video) return;

    document
      .querySelectorAll(".custom-playback-popup")
      .forEach((el) => el.remove());

    const popup = document.createElement("div");
    popup.textContent = message;
    popup.classList.add("custom-playback-popup");
    Object.assign(popup.style, STYLES.bpscVideoPopup);

    const rect = video.getBoundingClientRect();
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top + rect.height / POPUP_VERTICAL_DIVISOR}px`;
    getOverlayRoot().appendChild(popup);

    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), POPUP_FADE_MS + 100);
    }, POPUP_VISIBLE_MS);
  };

  // Every rate change made by a shortcut goes through here
  const applyRate = (rate) => {
    currentPlaybackRate = roundRate(rate);
    keepRateTarget = null; // a deliberate change cancels any pending keep-speed restore
    if (currentPlaybackRate !== PLAYBACK_RATE_DEFAULT) {
      lastCustomRate = currentPlaybackRate;
    }
    setPlaybackRate(currentPlaybackRate);
    showPopup(`${currentPlaybackRate.toFixed(2)}x`);
  };

  const modifyPlaybackRate = (action) => {
    const step = storedExtensionSettings.rateStep;

    switch (action) {
      case "reset":
        return applyRate(PLAYBACK_RATE_DEFAULT);
      case "increase":
        return applyRate(
          Math.min(currentPlaybackRate + step, MAX_PLAYBACK_RATE),
        );
      case "decrease":
        return applyRate(
          Math.max(currentPlaybackRate - step, MIN_PLAYBACK_RATE),
        );
      case "toggle":
        if (currentPlaybackRate !== PLAYBACK_RATE_DEFAULT) {
          return applyRate(PLAYBACK_RATE_DEFAULT);
        }
        // Go back to the last custom speed; nothing to return to yet
        if (lastCustomRate !== null) return applyRate(lastCustomRate);
        return;
      default:
        if (action.startsWith("preset:")) {
          const index = Number(action.split(":")[1]);
          return applyRate(PRESET_RATES[index]);
        }
        console.warn(`BPSC error - unknown playback action: ${action}`);
    }
  };

  // Keep the video in line with our rate if something has drifted away from it.
  // The ratechange listener is the source of truth for native changes.
  const syncRateWithPlayer = (video) => {
    if (Math.abs(video.playbackRate - currentPlaybackRate) > 0.001) {
      setPlaybackRate(currentPlaybackRate);
    }
  };

  // ---------------------------------------------------------------------------
  // On-screen display (time remaining / live delay, with current rate)
  // ---------------------------------------------------------------------------

  const setDisplayText = (text) => {
    if (!additionalText) return;

    if (!text) {
      additionalText.style.display = "none";
      return;
    }

    if (additionalText.textContent !== text) additionalText.textContent = text;
    additionalText.style.display = "inline-block";
  };

  const buildDisplayText = (timeBehind, isLive) => {
    const rateLabel = `${currentPlaybackRate.toFixed(2)}x`;

    if (isLive) {
      const details = [];
      if (timeBehind > SYNC_THRESHOLD)
        details.push(`${formatTime(timeBehind)} behind`);
      if (currentPlaybackRate !== PLAYBACK_RATE_DEFAULT)
        details.push(rateLabel);
      return details.length ? `(${details.join(" | ")})` : "";
    }

    if (currentPlaybackRate === PLAYBACK_RATE_DEFAULT) return "";
    return `(${formatTime(timeBehind / currentPlaybackRate)} left at ${rateLabel})`;
  };

  const updateDisplay = () => {
    if (!additionalText || !additionalText.isConnected) {
      cleanupDisplay();
      return;
    }

    const video = getVideo();
    if (!video) return;

    syncRateWithPlayer(video);

    // When a chapter title follows the text, match the gap on the right to the
    // gap on the left so the spacing is even. The chapter title can overlap the
    // text's edge, so the right margin is adjusted until the two gaps are equal.
    const chapter = document.querySelector(".ytp-chapter-container");
    const timeEl =
      document.querySelector(".ytp-time-display .ytp-time-wrapper") ||
      document.querySelector(".ytp-time-display");
    if (
      chapter &&
      timeEl &&
      additionalText.style.display !== "none" &&
      chapter.getBoundingClientRect().width > 0 &&
      chapter.getBoundingClientRect().left >=
        additionalText.getBoundingClientRect().left
    ) {
      const textRect = additionalText.getBoundingClientRect();
      const leftGap = textRect.left - timeEl.getBoundingClientRect().right;
      const rightGap = chapter.getBoundingClientRect().left - textRect.right;
      const currentMargin = parseFloat(additionalText.style.marginRight) || 0;
      const value = `${Math.max(0, currentMargin + (leftGap - rightGap)).toFixed(1)}px`;
      if (additionalText.style.marginRight !== value)
        additionalText.style.marginRight = value;
    } else if (additionalText.style.marginRight) {
      additionalText.style.marginRight = "";
    }

    const progressBar = document.querySelector(".ytp-progress-bar");
    if (!progressBar) {
      setDisplayText("");
      return;
    }

    const now = parseInt(progressBar.getAttribute("aria-valuenow") || "0", 10);
    const max = parseInt(progressBar.getAttribute("aria-valuemax") || "0", 10);
    // The live badge also exists, hidden, on regular videos, so an attribute
    // check alone isn't enough. Require the badge to actually be rendered.
    const liveBadge = document.querySelector(
      ".ytp-live-badge[aria-label], .ytp-live-badge[title]",
    );
    const isLive = Boolean(liveBadge && liveBadge.getClientRects().length > 0);

    setDisplayText(buildDisplayText(Math.max(0, max - now), isLive));
  };

  const cleanupDisplay = () => {
    if (displayIntervalId) {
      clearInterval(displayIntervalId);
      displayIntervalId = null;
    }
  };

  const removeExistingDisplay = () => {
    document.querySelectorAll(".bpsc-display").forEach((el) => el.remove());
  };

  // Attaches the display if the player UI is ready. Otherwise checkVideoExists
  // retries on the next DOM change.
  const initDisplay = () => {
    cleanupDisplay();
    removeExistingDisplay();
    additionalText = null;

    // Place the text after the time display, not inside the elapsed-time
    // element. On live streams YouTube hides that element, which made the
    // text exist in the DOM but never appear on screen.
    const timeDisplay = document.querySelector(".ytp-time-display");
    if (!timeDisplay) return;

    additionalText = document.createElement("span");
    additionalText.classList.add("bpsc-display");
    Object.assign(additionalText.style, STYLES.bpscTextDisplay, {
      display: "none",
    });
    // Match YouTube's time display so the text sits in the same pill style.
    // Falls back to a plain dark pill if YouTube's display has no background of its own.
    // YouTube draws the pill on the inner wrapper, not on .ytp-time-display itself
    const pill = timeDisplay.querySelector(".ytp-time-wrapper") || timeDisplay;
    const ref = getComputedStyle(pill);
    const pillHeight = parseFloat(ref.height);
    const hasOwnBackground =
      ref.backgroundColor &&
      ref.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      ref.backgroundColor !== "transparent";

    Object.assign(additionalText.style, {
      boxSizing: "border-box",
      alignSelf: "center",
      flexShrink: "0",
      whiteSpace: "nowrap",
      height: pillHeight ? `${pillHeight}px` : "28px",
      lineHeight: pillHeight ? `${pillHeight}px` : "28px",
      padding: hasOwnBackground ? ref.padding : "0 8px",
      borderRadius: hasOwnBackground ? ref.borderRadius : "4px",
      backgroundColor: hasOwnBackground
        ? ref.backgroundColor
        : "rgba(28, 28, 28, 0.8)",
      backdropFilter: hasOwnBackground ? ref.backdropFilter : "none",
      WebkitBackdropFilter: hasOwnBackground ? ref.backdropFilter : "none",
    });

    timeDisplay.after(additionalText);

    displayIntervalId = setInterval(updateDisplay, DISPLAY_UPDATE_INTERVAL_MS);
    updateDisplay();
  };

  // ---------------------------------------------------------------------------
  // Video / navigation tracking
  // ---------------------------------------------------------------------------

  const checkVideoExists = () => {
    const currentVideoId = getVideoIdFromUrl();
    if (!getVideo() || !currentVideoId) return;

    const videoChanged = currentVideoId !== lastVideoId;
    if (videoChanged) {
      lastVideoId = currentVideoId;

      if (storedExtensionSettings.keepSpeed) {
        // YouTube may reset the rate when the new video loads;
        // the ratechange listener restores this target during the guard window.
        keepRateTarget = currentPlaybackRate;
        keepRateUntil = Date.now() + KEEP_RATE_GUARD_MS;
      } else {
        keepRateTarget = null;
        currentPlaybackRate = PLAYBACK_RATE_DEFAULT;
      }
      setPlaybackRate(currentPlaybackRate);
    }

    // Re-init on a new video, or if the display element is missing
    // (for example because the player UI wasn't ready the last time).
    if (videoChanged || !document.querySelector(".bpsc-display")) {
      initDisplay();
    }
  };

  // Debounce: YouTube mutates the DOM constantly
  const scheduleCheck = () => {
    if (checkScheduled) return;
    checkScheduled = true;
    setTimeout(() => {
      checkScheduled = false;
      checkVideoExists();
    }, OBSERVER_DEBOUNCE_MS);
  };

  // ---------------------------------------------------------------------------
  // Keyboard handling
  // ---------------------------------------------------------------------------

  // True when the user is typing somewhere, so shortcuts shouldn't fire
  const isTextInputFocused = () => {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable || el.tagName === "TEXTAREA") return true;

    const nonTextTypes = [
      "checkbox",
      "radio",
      "button",
      "submit",
      "reset",
      "range",
      "file",
      "color",
    ];
    return el.tagName === "INPUT" && !nonTextTypes.includes(el.type);
  };

  const handleKeydown = (event) => {
    // Leave Ctrl/Alt/Meta combinations to the browser and OS
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (isTextInputFocused()) return;

    storedExtensionSettings = getStoredSettings();
    const s = storedExtensionSettings;

    // Only bind keys that are actually set (optional shortcuts may be empty)
    const actionMap = {};
    const bind = (key, action) => {
      if (key) actionMap[key] = action;
    };

    bind(s.rateIncreaseKey, "increase");
    bind(s.rateDecreaseKey, "decrease");
    bind(s.rateResetKey, "reset");
    bind(s.toggleKey, "toggle");
    s.presetKeys.forEach((key, i) => bind(key, `preset:${i}`));

    const action = actionMap[event.code];
    if (action) modifyPlaybackRate(action);
  };

  // ---------------------------------------------------------------------------
  // Settings modal
  // ---------------------------------------------------------------------------

  const updateSettings = (newSettings) => {
    Object.assign(storedExtensionSettings, newSettings);

    for (const [settingName, storageKey] of Object.entries(STORAGE_KEYS)) {
      GM_setValue(storageKey, newSettings[settingName]);
    }
    newSettings.presetKeys.forEach((key, i) =>
      GM_setValue(presetStorageKey(i), key),
    );
  };

  const cancelKeybindCapture = () => {
    if (!activeCapture) return;
    window.removeEventListener("keydown", activeCapture.listener, true);
    activeCapture.overlay.remove();
    activeCapture = null;
  };

  const createConfigMenu = () => {
    if (document.querySelector(".bpsc-config-modal")) return;

    const modal = document.createElement("div");
    modal.className = "bpsc-config-modal";
    Object.assign(modal.style, STYLES.bpscConfigContainer);

    const modalContent = document.createElement("div");
    Object.assign(modalContent.style, STYLES.bpscConfigContent);

    const title = document.createElement("h2");
    title.textContent = "Better Playback Speed Control - Settings";
    Object.assign(title.style, STYLES.bpscConfigTitle);
    modalContent.appendChild(title);

    const closeModal = () => {
      cancelKeybindCapture();
      modal.remove();
    };

    const getInputValue = (id) => modal.querySelector(`#${id}`).value;

    // Capture the next key press for a shortcut field.
    // Escape cancels, Backspace/Delete clears the field.
    const setKeybind = (inputId) => {
      cancelKeybindCapture();

      const input = modal.querySelector(`#${inputId}`);

      const overlay = document.createElement("div");
      overlay.textContent = "Press a key (Esc to cancel, Backspace to clear)";
      Object.assign(overlay.style, STYLES.bpscConfigOverlay);
      getOverlayRoot().appendChild(overlay);

      // Capture phase on window: runs first, so the key doesn't also trigger
      // a speed change or YouTube's own handlers.
      const listener = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.code === "Escape") {
          // leave the value unchanged
        } else if (event.code === "Backspace" || event.code === "Delete") {
          input.value = "";
        } else {
          input.value = event.code;
        }
        cancelKeybindCapture();
      };

      activeCapture = { overlay, listener };
      window.addEventListener("keydown", listener, true);
    };

    const createInputContainer = (label, value, id, options = {}) => {
      const { isStep = false, placeholder = "" } = options;

      const row = document.createElement("div");
      row.style.marginBottom = "15px";
      row.style.display = "flex";
      row.style.alignItems = "center";

      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      Object.assign(labelEl.style, STYLES.bpscConfigInputLabel);

      const input = document.createElement("input");
      input.type = isStep ? "number" : "text";
      input.value = value;
      input.id = id;
      input.placeholder = placeholder;
      input.readOnly = !isStep;
      if (isStep) {
        input.min = "0.01";
        input.step = "any";
      }
      Object.assign(input.style, STYLES.bpscConfigInput);

      row.append(labelEl, input);

      if (!isStep) {
        const setButton = document.createElement("button");
        setButton.textContent = "Set";
        Object.assign(setButton.style, STYLES.bpscConfigButtonSet);
        setButton.addEventListener("click", () => setKeybind(id));
        row.appendChild(setButton);
      }

      return row;
    };

    const createCheckboxRow = (label, checked, id) => {
      const row = document.createElement("div");
      row.style.marginBottom = "15px";
      row.style.display = "flex";
      row.style.alignItems = "center";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.checked = checked;
      input.style.marginRight = "10px";

      const labelEl = document.createElement("label");
      labelEl.htmlFor = id;
      labelEl.textContent = label;
      labelEl.style.color = COLORS.textPrimary;
      labelEl.style.cursor = "pointer";

      row.append(input, labelEl);
      return row;
    };

    // Required shortcuts
    modalContent.appendChild(
      createInputContainer(
        "Increase Speed Shortcut",
        storedExtensionSettings.rateIncreaseKey,
        "increaseKeyInput",
      ),
    );
    modalContent.appendChild(
      createInputContainer(
        "Decrease Speed Shortcut",
        storedExtensionSettings.rateDecreaseKey,
        "decreaseKeyInput",
      ),
    );

    // Optional shortcuts
    modalContent.appendChild(
      createInputContainer(
        "Reset Speed Shortcut",
        storedExtensionSettings.rateResetKey,
        "resetKeyInput",
        {
          placeholder: "Not set",
        },
      ),
    );
    modalContent.appendChild(
      createInputContainer(
        "Toggle Custom / 1x Shortcut",
        storedExtensionSettings.toggleKey,
        "toggleKeyInput",
        {
          placeholder: "Not set",
        },
      ),
    );
    PRESET_RATES.forEach((rate, i) => {
      modalContent.appendChild(
        createInputContainer(
          `${rate.toFixed(2)}x Shortcut`,
          storedExtensionSettings.presetKeys[i] || "",
          `presetKeyInput${i}`,
          { placeholder: "Not set" },
        ),
      );
    });

    modalContent.appendChild(
      createInputContainer(
        "Playback Rate Step",
        storedExtensionSettings.rateStep,
        "rateStepInput",
        { isStep: true },
      ),
    );

    modalContent.appendChild(
      createCheckboxRow(
        "Keep speed between videos",
        storedExtensionSettings.keepSpeed,
        "keepSpeedInput",
      ),
    );

    const resetSettings = () => {
      modal.querySelector("#increaseKeyInput").value =
        DEFAULT_SETTINGS.rateIncreaseKey;
      modal.querySelector("#decreaseKeyInput").value =
        DEFAULT_SETTINGS.rateDecreaseKey;
      modal.querySelector("#resetKeyInput").value =
        DEFAULT_SETTINGS.rateResetKey;
      modal.querySelector("#toggleKeyInput").value = DEFAULT_SETTINGS.toggleKey;
      PRESET_RATES.forEach((_, i) => {
        modal.querySelector(`#presetKeyInput${i}`).value =
          DEFAULT_SETTINGS.presetKeys[i];
      });
      modal.querySelector("#rateStepInput").value = DEFAULT_SETTINGS.rateStep;
      modal.querySelector("#keepSpeedInput").checked =
        DEFAULT_SETTINGS.keepSpeed;
    };

    const saveSettings = () => {
      const newSettings = {
        rateIncreaseKey: getInputValue("increaseKeyInput").trim(),
        rateDecreaseKey: getInputValue("decreaseKeyInput").trim(),
        rateResetKey: getInputValue("resetKeyInput").trim(),
        toggleKey: getInputValue("toggleKeyInput").trim(),
        presetKeys: PRESET_RATES.map((_, i) =>
          getInputValue(`presetKeyInput${i}`).trim(),
        ),
        rateStep: parseFloat(getInputValue("rateStepInput")),
        keepSpeed: modal.querySelector("#keepSpeedInput").checked,
      };

      const required = [
        newSettings.rateIncreaseKey,
        newSettings.rateDecreaseKey,
      ];
      if (required.some((key) => !key)) {
        alert("Error: Increase and decrease shortcuts must be set.");
        return;
      }

      const allKeys = [
        ...required,
        newSettings.rateResetKey,
        newSettings.toggleKey,
        ...newSettings.presetKeys,
      ].filter(Boolean);
      if (new Set(allKeys).size !== allKeys.length) {
        alert(
          "Error: Conflicting keybinds detected.\nPlease ensure all shortcuts are unique.",
        );
        return;
      }

      if (!Number.isFinite(newSettings.rateStep) || newSettings.rateStep <= 0) {
        alert("Error: Playback Rate Step must be a positive number.");
        return;
      }

      updateSettings(newSettings);
      closeModal();
    };

    const buttonContainer = document.createElement("div");
    buttonContainer.style.textAlign = "center";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    Object.assign(
      saveButton.style,
      STYLES.bpscConfigButton,
      STYLES.bpscConfigButtonSave,
    );

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset to Defaults";
    Object.assign(resetButton.style, STYLES.bpscConfigButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    Object.assign(
      cancelButton.style,
      STYLES.bpscConfigButton,
      STYLES.bpscConfigButtonCancel,
    );

    saveButton.addEventListener("click", saveSettings);
    resetButton.addEventListener("click", resetSettings);
    cancelButton.addEventListener("click", closeModal);

    buttonContainer.append(saveButton, resetButton, cancelButton);
    modalContent.appendChild(buttonContainer);

    // Clicking the dimmed background closes the modal
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    modal.appendChild(modalContent);
    getOverlayRoot().appendChild(modal);
  };

  // ---------------------------------------------------------------------------
  // Startup
  // ---------------------------------------------------------------------------

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("Settings", createConfigMenu);
  }

  // YouTube is a single-page app, so watch for new videos and navigation
  const observer = new MutationObserver(scheduleCheck);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("yt-navigate-finish", scheduleCheck);
  window.addEventListener("popstate", scheduleCheck);

  checkVideoExists();
  window.addEventListener("keydown", handleKeydown);

  // Track rate changes made outside this script (e.g. YouTube's speed menu)
  document.addEventListener(
    "ratechange",
    (event) => {
      if (!(event.target instanceof HTMLVideoElement)) return;

      const rate = event.target.playbackRate;

      // Undo a reset by YouTube right after a video change when keep-speed is on
      if (keepRateTarget !== null && Date.now() < keepRateUntil) {
        if (Math.abs(rate - keepRateTarget) > 0.001) {
          setPlaybackRate(keepRateTarget);
          return;
        }
      } else {
        keepRateTarget = null;
      }

      currentPlaybackRate = rate;
      if (rate !== PLAYBACK_RATE_DEFAULT) lastCustomRate = rate;
    },
    true,
  );
})();
