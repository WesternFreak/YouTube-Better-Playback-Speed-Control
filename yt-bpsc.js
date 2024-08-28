// ==UserScript==
// @name         YouTube - Better Playback Speed Control
// @version      1.0.0
// @namespace    https://github.com/WesternFreak/YouTube-Better-Playback-Speed-Control
// @description  Customizable keyboard shortcuts to increase, decrease and reset playback rate, while also displaying relevant information directly in the video player.
// @icon         data:image/png;base64,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
// @author       WesternFreak
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
    rateResetKey: 'NumpadEnter'
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
