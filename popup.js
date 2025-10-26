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
const advancedBtn = document.getElementById('advancedBtn');
const defaultSliders = document.getElementById('defaultSliders');
const advancedEQ = document.getElementById('advancedEQ');

// EQ band elements
const eqBands = {
  eq60: { handle: document.getElementById('eq60'), value: document.getElementById('eq60Value'), freq: 60 },
  eq150: { handle: document.getElementById('eq150'), value: document.getElementById('eq150Value'), freq: 150 },
  eq400: { handle: document.getElementById('eq400'), value: document.getElementById('eq400Value'), freq: 400 },
  eq1k: { handle: document.getElementById('eq1k'), value: document.getElementById('eq1kValue'), freq: 1000 },
  eq2k4: { handle: document.getElementById('eq2k4'), value: document.getElementById('eq2k4Value'), freq: 2400 },
  eq15k: { handle: document.getElementById('eq15k'), value: document.getElementById('eq15kValue'), freq: 15000 }
};

// Audio settings state
let settings = {
  volume: 50,
  bass: 0,
  treble: 0,
  aiMode: false,
  advancedMode: false,
  eq: {
    60: 0,
    150: 0,
    400: 0,
    1000: 0,
    2400: 0,
    15000: 0
  }
};

// Load saved settings
chrome.storage.sync.get(['volume', 'bass', 'treble', 'aiMode', 'advancedMode', 'eq'], (result) => {
  if (result.volume !== undefined) settings.volume = result.volume;
  if (result.bass !== undefined) settings.bass = result.bass;
  if (result.treble !== undefined) settings.treble = result.treble;
  if (result.aiMode !== undefined) settings.aiMode = result.aiMode;
  if (result.advancedMode !== undefined) settings.advancedMode = result.advancedMode;
  if (result.eq !== undefined) settings.eq = result.eq;
  
  updateUI();
});

// Update UI based on settings
function updateUI() {
  volumeValue.textContent = settings.volume;
  bassValue.textContent = settings.bass > 0 ? `+${settings.bass}` : settings.bass;
  trebleValue.textContent = settings.treble > 0 ? `+${settings.treble}` : settings.treble;
  
  // Update dial rotation (with light-up effect)
  const rotation = (settings.volume / 100) * 270 - 135;
  volumeDial.style.transform = `rotate(${rotation}deg)`;
  
  // Update slider positions
  updateSliderPosition(bassSlider, settings.bass);
  updateSliderPosition(trebleSlider, settings.treble);
  
  // Update EQ positions
  Object.keys(eqBands).forEach(key => {
    const band = eqBands[key];
    const value = settings.eq[band.freq];
    updateSliderPosition(band.handle, value);
    band.value.textContent = value > 0 ? `+${value}` : value;
  });
  
  // Update AI toggle
  aiToggle.classList.toggle('active', settings.aiMode);
  
  // Update view mode (with animated transition)
  if (settings.advancedMode) {
    defaultSliders.classList.add('hidden');
    advancedEQ.classList.remove('hidden');
    advancedBtn.textContent = 'Simple Mode';
    advancedBtn.classList.add('active');
  } else {
    defaultSliders.classList.remove('hidden');
    advancedEQ.classList.add('hidden');
    advancedBtn.textContent = 'Advanced Settings';
    advancedBtn.classList.remove('active');
  }
}

function updateSliderPosition(slider, value) {
  // Value range: -12 to +12
  const percentage = ((value + 12) / 24) * 100;
  slider.style.top = `${100 - percentage}%`;
  
  // Add light-up effect when moving
  slider.classList.add('active');
  setTimeout(() => slider.classList.remove('active'), 300);
}

// Volume dial interaction (rotatable with visual feedback)
let isDraggingDial = false;

const handleDialRotation = (e) => {
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

volumeDial.addEventListener('mousedown', () => {
  isDraggingDial = true;
  volumeDial.classList.add('dragging');
});

document.addEventListener('mousemove', handleDialRotation);

document.addEventListener('mouseup', () => {
  isDraggingDial = false;
  volumeDial.classList.remove('dragging');
});

// Slider interactions (with visual feedback)
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
  
  slider.addEventListener('mousedown', () => {
    isDragging = true;
    slider.classList.add('dragging');
  });
  
  document.addEventListener('mousemove', handleDrag);
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    slider.classList.remove('dragging');
  });
}

setupSlider(bassSlider, 'bass', bassValue);
setupSlider(trebleSlider, 'treble', trebleValue);

// Setup EQ sliders
Object.keys(eqBands).forEach(key => {
  const band = eqBands[key];
  let isDragging = false;
  
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const track = band.handle.parentElement;
    const rect = track.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (1 - y / rect.height) * 100));
    const value = Math.round((percentage / 100) * 24 - 12);
    
    settings.eq[band.freq] = value;
    updateUI();
    saveSettings();
  };
  
  band.handle.addEventListener('mousedown', () => {
    isDragging = true;
    band.handle.classList.add('dragging');
  });
  
  document.addEventListener('mousemove', handleDrag);
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    band.handle.classList.remove('dragging');
  });
});

// Advanced Settings toggle (with animated transition)
advancedBtn.addEventListener('click', () => {
  settings.advancedMode = !settings.advancedMode;
  updateUI();
  saveSettings();
});

// AI toggle (with visual feedback)
aiToggle.addEventListener('click', () => {
  settings.aiMode = !settings.aiMode;
  updateUI();
  saveSettings();
});

// Reset button (with confirmation)
resetBtn.addEventListener('click', () => {
  settings = { 
    volume: 50, 
    bass: 0, 
    treble: 0, 
    aiMode: false, 
    advancedMode: false,
    eq: { 60: 0, 150: 0, 400: 0, 1000: 0, 2400: 0, 15000: 0 }
  };
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
