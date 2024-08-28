// ==UserScript==
// @name         YouTube - Better Playback Speed Control
// @version      1.0.0
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

;(function () {
  'use strict'

  // Default settings
  const defaultExtensionSettings = {
    rateIncreaseKey: 'NumpadAdd',
    rateDecreaseKey: 'NumpadSubtract',
    rateResetKey: 'NumpadDecimal'
  }

  // Load settings
  const getStoredSettings = () => ({
    rateIncreaseKey: GM_getValue(
      'speedIncreaseKey',
      defaultExtensionSettings.rateIncreaseKey
    ),
    rateDecreaseKey: GM_getValue(
      'speedDecreaseKey',
      defaultExtensionSettings.rateDecreaseKey
    ),
    rateResetKey: GM_getValue(
      'speedResetKey',
      defaultExtensionSettings.rateResetKey
    )
  })

  const PLAYBACK_RATE_DEFAULT = 1.0 // Default playback speed
  const MIN_PLAYBACK_RATE = 0.25 // Minimum allowed playback speed
  const MAX_PLAYBACK_RATE = 5.0 // Maximum allowed playback speed
  const PLAYBACK_RATE_STEP = 0.25 // Playback speed step change
  const SYNC_THRESHOLD = 10 // Threshold in seconds for sync detection

  let storedExtensionSettings = getStoredSettings()
  let currentPlaybackRate = PLAYBACK_RATE_DEFAULT
  let additionalText
  let lastVideoId = ''

  const COLORS = {
    textPrimary: '#eee',
    textSecondary: '#ccc',
    backgroundPrimary: '#333',
    backgroundSecondary: '#444',
    backgroundOverlay: 'rgba(0, 0, 0, 0.45)',
    buttonNeutral: '#1e90ff',
    buttonPositive: '#28a745',
    buttonNegative: '#dc3545'
  }

  const STYLES = {
    bpscTextDisplay: {
      display: 'inline-block',
      marginLeft: '10px',
      color: COLORS.textPrimary
    },
    bpscConfigTitle: {
      color: COLORS.textPrimary,
      marginBottom: '20px',
      textAlign: 'center'
    },
    bpscConfigContainer: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: '1000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
      color: COLORS.textSecondary
    },
    bpscConfigContent: {
      backgroundColor: COLORS.backgroundPrimary,
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      maxWidth: '350px',
      width: '100%'
    },
    bpscConfigOverlay: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      zIndex: '1000'
    },
    bpscConfigInput: {
      width: '100%',
      padding: '8px',
      boxSizing: 'border-box',
      border: '1px solid #555',
      borderRadius: '4px',
      flex: '2',
      marginRight: '10px',
      backgroundColor: COLORS.backgroundSecondary,
      color: COLORS.textSecondary
    },
    bpscConfigInputLabel: {
      display: 'block',
      marginBottom: '5px',
      color: COLORS.textPrimary
    },
    bpscConfigButton: {
      padding: '10px 15px',
      color: COLORS.textPrimary,
      border: 'none',
      borderRadius: '5px',
      marginRight: '5px',
      marginLeft: '5px',
      cursor: 'pointer',
      backgroundColor: COLORS.buttonNeutral,
      transition: 'background-color 0.3s ease'
    },
    bpscConfigButtonSet: {
      padding: '5px 10px',
      cursor: 'pointer',
      backgroundColor: '#008CBA',
      color: '#fff',
      border: 'none',
      borderRadius: '3px'
    },
    bpscConfigButtonSave: {
      backgroundColor: COLORS.buttonPositive
    },
    bpscConfigButtonCancel: {
      backgroundColor: COLORS.buttonNegative
    },
    bpscVideoPopup: {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      backgroundColor: COLORS.backgroundOverlay,
      color: COLORS.textPrimary,
      padding: '10px 20px',
      borderRadius: '5px',
      zIndex: '9999',
      fontFamily: 'Arial, sans-serif',
      fontSize: 'large',
      opacity: '1',
      transition: 'opacity 0.5s ease'
    }
  }

  // format time as HH:MM:SS
  const formatTime = time => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    const formattedHours =
      hours > 0 ? hours.toString().padStart(2, '0') + ':' : ''
    const formattedMinutes = minutes.toString().padStart(2, '0')
    const formattedSeconds = seconds.toString().padStart(2, '0')

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`
  }

  // set video playback rate
  const setPlaybackRate = rate => {
    const video = document.querySelector('video')
    if (video) video.playbackRate = rate
  }

  // get video playback rate
  const getPlaybackRate = () => {
    const video = document.querySelector('video')
    if (video) return video.playbackRate
  }

  // changes video playback rate
  const modifyPlaybackRate = action => {
    currentPlaybackRate = getPlaybackRate()
    let newRate = currentPlaybackRate

    switch (action) {
      case 'reset':
        newRate = 1.0
        break
      case 'increase':
        newRate = Math.min(
          currentPlaybackRate + PLAYBACK_RATE_STEP,
          MAX_PLAYBACK_RATE
        )
        break
      case 'decrease':
        newRate = Math.max(
          currentPlaybackRate - PLAYBACK_RATE_STEP,
          MIN_PLAYBACK_RATE
        )
        break
      default:
        console.warn(`BPSC error - unknown playback action: ${action}`)
        return
    }

    currentPlaybackRate = newRate
    setPlaybackRate(currentPlaybackRate)
    showPopup(`${currentPlaybackRate.toFixed(2)}x`)
  }

  // display popup in video player's top-middle
  const showPopup = message => {
    const video = document.querySelector('video')
    if (!video) return

    const existingPopup = document.querySelector('.custom-playback-popup')
    if (existingPopup) existingPopup.remove()

    const popup = document.createElement('div')
    popup.textContent = message
    popup.classList.add('custom-playback-popup')
    Object.assign(popup.style, STYLES.bpscVideoPopup)

    const rect = video.getBoundingClientRect()
    popup.style.left = `${rect.left + rect.width / 2}px`
    popup.style.top = `${rect.top + rect.height / 7.5}px`
    document.body.appendChild(popup)

    setTimeout(() => {
      popup.style.opacity = '0'
      setTimeout(() => popup.remove(), 100)
    }, 500)
  }

  // Update player text display
  const updateDisplay = () => {
    const video = document.querySelector('video')
    if (!video) return
    const playerProgressBar = document.querySelector('.ytp-progress-bar')
    if (!playerProgressBar) return
    const videoTimeNow = parseInt(
      playerProgressBar.getAttribute('aria-valuenow'),
      10
    )
    const videoTimeMax = parseInt(
      playerProgressBar.getAttribute('aria-valuemax'),
      10
    )
    const videoTimeBehind = videoTimeMax - videoTimeNow
    const isLivestream = document.querySelector(
      '.ytp-live-badge:not([disabled="true"])'
    )
    const playbackRateFormatted = getPlaybackRate().toFixed(2)

    if (isLivestream) {
      updateLivestreamText(videoTimeBehind, playbackRateFormatted)
    } else {
      updateVideoText(videoTimeBehind, playbackRateFormatted)
    }

    requestAnimationFrame(updateDisplay)
  }

  // Update text display - livestreams
  const updateLivestreamText = (timeBehindLive, playbackRateFormatted) => {
    let newText = ''

    if (timeBehindLive > SYNC_THRESHOLD) {
      newText = `(${formatTime(timeBehindLive)} behind`
    }

    if (currentPlaybackRate !== PLAYBACK_RATE_DEFAULT) {
      newText += newText
        ? ` | ${playbackRateFormatted}x`
        : `(${playbackRateFormatted}x`
    }

    if (newText) {
      newText += ')'
    }

    additionalText.textContent = newText
  }

  // Function to update the text on the screen for regular videos
  const updateVideoText = (timeToEnd, playbackRateFormatted) => {
    if (currentPlaybackRate === PLAYBACK_RATE_DEFAULT) {
      additionalText.textContent = ''
    } else {
      const adjustedTimeRemaining = formatTime(timeToEnd / currentPlaybackRate)
      additionalText.textContent = `(${adjustedTimeRemaining} left at ${playbackRateFormatted}x)`
    }
  }

  // Function to remove existing display elements
  const removeExistingDisplay = () => {
    const existingDisplay = document.querySelector('.ytp-time-display div')
    if (existingDisplay) existingDisplay.remove()
  }

  // Initialize the display element for time and playback rate
  const initDisplay = () => {
    removeExistingDisplay()

    additionalText = document.createElement('div')
    Object.assign(additionalText.style, STYLES.bpscTextDisplay)
    const timeContainer = document.querySelector('.ytp-time-display')

    if (timeContainer) {
      timeContainer.appendChild(additionalText)
      requestAnimationFrame(updateDisplay)
      observer.disconnect()
    }
  }

  // Function to get the current video ID from the URL
  const getVideoIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('v')
  }

  // Check if a video element exists and initialize the display
  const checkVideoExists = () => {
    const video = document.querySelector('video')
    const currentVideoId = getVideoIdFromUrl()

    if (video && currentVideoId !== lastVideoId) {
      lastVideoId = currentVideoId
      currentPlaybackRate = PLAYBACK_RATE_DEFAULT
      setPlaybackRate(currentPlaybackRate)
      initDisplay()
    }
  }

  // Function to check if the focused element is a text input, textarea, or contenteditable element
  const isTextInputFocused = () => {
    const activeElement = document.activeElement

    const isTextInput = element =>
      element.tagName === 'INPUT' &&
      ['text', 'search', 'email'].includes(element.type)

    return (
      activeElement.tagName === 'TEXTAREA' ||
      isTextInput(activeElement) ||
      (activeElement.hasAttribute('contenteditable') &&
        activeElement.isContentEditable)
    )
  }

  // Event handler for keydown events to modify playback rate
  const handleKeydown = event => {
    if (isTextInputFocused()) return

    const actionMap = {
      [storedExtensionSettings.rateIncreaseKey]: 'increase',
      [storedExtensionSettings.rateDecreaseKey]: 'decrease',
      [storedExtensionSettings.rateResetKey]: 'reset'
    }

    const action = actionMap[event.code]

    if (action) modifyPlaybackRate(action)
  }

  // Create a modal for configuring script settings
  const createConfigMenu = () => {
    // prevent multiple modals
    if (document.querySelector('.bpsc-config-modal')) return

    // config modal container
    const modal = document.createElement('div')
    modal.className = 'bpsc-config-modal'
    Object.assign(modal.style, STYLES.bpscConfigContainer)

    // config modal content
    const modalContent = document.createElement('div')
    Object.assign(modalContent.style, STYLES.bpscConfigContent)

    // config modal title
    const title = document.createElement('h2')
    title.textContent = 'Better Playback Speed Control - Keybinds'
    Object.assign(title.style, STYLES.bpscConfigTitle)
    modalContent.appendChild(title)

    // create a label, input field, set button, and append them
    const createInputContainer = (label, value, id) => {
      const inputContainer = document.createElement('div')
      inputContainer.style.marginBottom = '15px'
      inputContainer.style.display = 'flex'

      const inputLabel = document.createElement('label')
      inputLabel.textContent = label
      inputLabel.style.flex = '1'
      Object.assign(inputLabel.style, STYLES.bpscConfigInputLabel)

      const inputText = document.createElement('input')
      inputText.type = 'text'
      inputText.value = value
      inputText.id = id
      inputText.readOnly = true
      Object.assign(inputText.style, STYLES.bpscConfigInput)

      const setButton = document.createElement('button')
      setButton.textContent = 'Set'
      Object.assign(setButton.style, STYLES.bpscConfigButtonSet)

      setButton.addEventListener('click', () => setKeybind(id))

      inputContainer.appendChild(inputLabel)
      inputContainer.appendChild(inputText)
      inputContainer.appendChild(setButton)

      return inputContainer
    }

    // input field and set button per keybind
    modalContent.appendChild(
      createInputContainer(
        'Increase Speed Shortcut',
        storedExtensionSettings.rateIncreaseKey,
        'increaseKeyInput'
      )
    )
    modalContent.appendChild(
      createInputContainer(
        'Decrease Speed Shortcut',
        storedExtensionSettings.rateDecreaseKey,
        'decreaseKeyInput'
      )
    )
    modalContent.appendChild(
      createInputContainer(
        'Reset Speed Shortcut',
        storedExtensionSettings.rateResetKey,
        'resetKeyInput'
      )
    )

    // button container
    const buttonContainer = document.createElement('div')
    buttonContainer.style.textAlign = 'center'

    // Save, Reset, and Cancel buttons
    const saveButton = document.createElement('button')
    saveButton.textContent = 'Save'
    Object.assign(
      saveButton.style,
      STYLES.bpscConfigButton,
      STYLES.bpscConfigButtonSave
    )

    const resetButton = document.createElement('button')
    resetButton.textContent = 'Reset to Defaults'
    Object.assign(resetButton.style, STYLES.bpscConfigButton)

    const cancelButton = document.createElement('button')
    cancelButton.textContent = 'Cancel'
    Object.assign(
      cancelButton.style,
      STYLES.bpscConfigButton,
      STYLES.bpscConfigButtonCancel
    )

    saveButton.addEventListener('click', saveSettings)
    resetButton.addEventListener('click', resetSettings)
    cancelButton.addEventListener('click', () => modal.remove())

    buttonContainer.appendChild(saveButton)
    buttonContainer.appendChild(resetButton)
    buttonContainer.appendChild(cancelButton)
    modalContent.appendChild(buttonContainer)

    // Finish the modal
    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // Function to update stored settings and save them
    const updateSettings = newSettings => {
      Object.assign(storedExtensionSettings, newSettings)
      GM_setValue('speedIncreaseKey', newSettings.rateIncreaseKey)
      GM_setValue('speedDecreaseKey', newSettings.rateDecreaseKey)
      GM_setValue('speedResetKey', newSettings.rateResetKey)
    }

    // Function to save the settings and update the stored values
    function saveSettings () {
      const newSettings = {
        rateIncreaseKey: document.getElementById('increaseKeyInput').value,
        rateDecreaseKey: document.getElementById('decreaseKeyInput').value,
        rateResetKey: document.getElementById('resetKeyInput').value
      }

      // Check for conflicts
      const keys = Object.values(newSettings)
      const hasConflicts = keys.some(
        (key, index) => keys.indexOf(key) !== index
      )

      if (hasConflicts) {
        alert(
          'Error: Conflicting keybinds detected.\nPlease ensure all shortcuts are unique.'
        )
        return
      }

      updateSettings(newSettings)
      modal.remove()
    }

    // Function to reset the settings to their defaults
    function resetSettings () {
      document.getElementById('increaseKeyInput').value =
        defaultExtensionSettings.rateIncreaseKey
      document.getElementById('decreaseKeyInput').value =
        defaultExtensionSettings.rateDecreaseKey
      document.getElementById('resetKeyInput').value =
        defaultExtensionSettings.rateResetKey
    }

    // Function to set a keybind by detecting the next key press
    function setKeybind (inputId) {
      // Create an overlay to block other interactions and inform the user
      const overlay = document.createElement('div')
      overlay.textContent = 'Press any key to set the new shortcut'
      Object.assign(overlay.style, STYLES.bpscConfigOverlay)
      document.body.appendChild(overlay)

      // Listen for the next keydown event
      const keydownListener = event => {
        event.preventDefault()
        event.stopImmediatePropagation()

        // Set the key code in the corresponding input field
        const keyPressed = event.code
        document.getElementById(inputId).value = keyPressed

        // Clean up
        overlay.remove()
        document.removeEventListener('keydown', keydownListener)
      }

      // Attach the keydown listener
      document.addEventListener('keydown', keydownListener, { once: true })
    }
  }

  // Register the menu command for configuration
  GM_registerMenuCommand('Customize Keybinds', createConfigMenu)

  // MutationObserver to monitor DOM for video element or URL changes
  const observer = new MutationObserver(checkVideoExists)
  observer.observe(document.body, { childList: true, subtree: true })

  // Listen for changes in the URL (which might happen without a page reload)
  window.addEventListener('yt-navigate-finish', checkVideoExists)
  window.addEventListener('popstate', checkVideoExists) // Handle back/forward navigation

  // Initial check when the script runs
  checkVideoExists()

  // Add event listener for keydown events
  window.addEventListener('keydown', handleKeydown)
})()
