// Popup script for AI Audio Master

// Get UI elements
const volumeDial = document.getElementById('volumeDial');
const volumeValue = document.getElementById('volumeValue');
const bassSlider = document.getElementById('bassSlider');
const trebleSlider = document.getElementById('trebleSlider');
const bassValue = document.getElementById('bassValue');
const trebleValue = document.getElementById('trebleValue');
const aiToggle = document.getElementById('aiToggle');
const resetBtn = document.getElementById('resetBtn');

// Audio settings state
let settings = {
  volume: 50,
  bass: 0,
  treble: 0,
  aiMode: false
};

// Load saved settings
chrome.storage.sync.get(['volume', 'bass', 'treble', 'aiMode'], (result) => {
  if (result.volume !== undefined) settings.volume = result.volume;
  if (result.bass !== undefined) settings.bass = result.bass;
  if (result.treble !== undefined) settings.treble = result.treble;
  if (result.aiMode !== undefined) settings.aiMode = result.aiMode;
  
  updateUI();
});

// Update UI based on settings
function updateUI() {
  volumeValue.textContent = settings.volume;
  bassValue.textContent = settings.bass > 0 ? `+${settings.bass}` : settings.bass;
  trebleValue.textContent = settings.treble > 0 ? `+${settings.treble}` : settings.treble;
  
  // Update dial rotation
  const rotation = (settings.volume / 100) * 270 - 135;
  volumeDial.style.transform = `rotate(${rotation}deg)`;
  
  // Update slider positions
  updateSliderPosition(bassSlider, settings.bass);
  updateSliderPosition(trebleSlider, settings.treble);
  
  // Update AI toggle
  aiToggle.classList.toggle('active', settings.aiMode);
}

function updateSliderPosition(slider, value) {
  // Value range: -12 to +12
  const percentage = ((value + 12) / 24) * 100;
  slider.style.top = `${100 - percentage}%`;
}

// Volume dial interaction
let isDraggingDial = false;
volumeDialconst handleDialRotation = (e) => {
  if (!isDraggingDial) return;
  
  const rect = volumeDial.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
  const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
  
  if (degrees <= 270) {
    settings.volume = Math.round((degrees / 270) * 100);
    updateUI();
    saveSettings();
  }
};

volumeDialDial.addEventListener('mousedown', () => isDraggingDial = true);
document.addEventListener('mousemove', handleDialRotation);
document.addEventListener('mouseup', () => isDraggingDial = false);

// Slider interactions
function setupSlider(slider, settingKey, valueElement) {
  let isDragging = false;
  
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const track = slider.parentElement;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (1 - y / rect.height) * 100));
    const value = Math.round((percentage / 100) * 24 - 12);
    
    settings[settingKey] = value;
    updateUI();
    saveSettings();
  };
  
  slider.addEventListener('mousedown', () => isDragging = true);
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', () => isDragging = false);
}

setupSlider(bassSlider, 'bass', bassValue);
setupSlider(trebleSlider, 'treble', trebleValue);

// AI toggle
aiToggle.addEventListener('click', () => {
  settings.aiMode = !settings.aiMode;
  updateUI();
  saveSettings();
});

// Reset button
resetBtn.addEventListener('click', () => {
  settings = { volume: 50, bass: 0, treble: 0, aiMode: false };
  updateUI();
  saveSettings();
});

// Save settings
function saveSettings() {
  chrome.storage.sync.set(settings);
  chrome.runtime.sendMessage({
    action: 'updateAudioSettings',
    settings: settings
  });
}
