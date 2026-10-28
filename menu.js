/* global COIN_DASH, COIN_DASH_FEATURES, COIN_DASH_SETTINGS, createCoinDashGame */
const menu = document.getElementById('menu');
const form = document.getElementById('feature-form');
const options = document.getElementById('feature-options');
const gameContainer = document.getElementById('game');
const gameControls = document.getElementById('game-controls');
const droneCountInput = document.getElementById('drone-count');
const droneCountOptions = document.getElementById('drone-count-options');
const fastDroneNote = document.getElementById('fast-drone-note');
let game = null;
const settingsToggle = document.getElementById('settings-toggle');
const settingsPanel = document.getElementById('settings-panel');
const playerSpeed = document.getElementById('player-speed');
const droneGrowthRate = document.getElementById('drone-growth-rate');

function closeSettings() {
  if (settingsPanel.hidden) return;
  settingsPanel.hidden = true;
  settingsToggle.setAttribute('aria-expanded', 'false');
  settingsToggle.textContent = 'Settings';
  if (game) {
    game.input.keyboard.enabled = true;
    game.input.keyboard.resetKeys();
    if (game.scene.isPaused('CoinDash')) game.scene.resume('CoinDash');
  }
}

settingsToggle.addEventListener('click', () => {
  if (!settingsPanel.hidden) {
    closeSettings();
    return;
  }
  settingsPanel.hidden = false;
  settingsToggle.setAttribute('aria-expanded', 'true');
  settingsToggle.textContent = 'Close settings';
  if (game) {
    game.input.keyboard.resetKeys();
    game.input.keyboard.enabled = false;
    if (game.scene.isActive('CoinDash')) game.scene.pause('CoinDash');
  }
});

playerSpeed.addEventListener('input', () => {
  COIN_DASH_SETTINGS.playerSpeed = Number(playerSpeed.value);
  document.getElementById('player-speed-value').textContent = `${playerSpeed.value} px/s`;
});

droneGrowthRate.addEventListener('input', () => {
  COIN_DASH_SETTINGS.droneGrowthRate = Number(droneGrowthRate.value);
  document.getElementById('drone-growth-rate-value').textContent = `${Number(droneGrowthRate.value)}×`;
});

playerSpeed.value = COIN_DASH_SETTINGS.playerSpeed;
droneGrowthRate.value = COIN_DASH_SETTINGS.droneGrowthRate;
playerSpeed.dispatchEvent(new Event('input'));
droneGrowthRate.dispatchEvent(new Event('input'));

droneCountInput.min = COIN_DASH.minDrones;
droneCountInput.max = COIN_DASH.maxDrones;
droneCountInput.value = COIN_DASH.droneCount;

for (let count = COIN_DASH.minDrones; count <= COIN_DASH.maxDrones; count++) {
  const label = document.createElement('label');
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'drone-choice';
  radio.value = count;
  radio.checked = count === COIN_DASH.droneCount;
  const number = document.createElement('span');
  number.textContent = count;
  label.append(radio, number);
  droneCountOptions.append(label);
}

function syncDroneChoice() {
  const selected = droneCountOptions.querySelector(`input[value="${droneCountInput.value}"]`);
  if (selected) selected.checked = true;
}

function updateFastDroneNote() {
  const count = Math.max(COIN_DASH.minDrones,
    Math.min(COIN_DASH.maxDrones, Number(droneCountInput.value) || COIN_DASH.droneCount));
  const fast = Math.floor((count + COIN_DASH.fastDroneEvery - 2) / COIN_DASH.fastDroneEvery);
  fastDroneNote.textContent = fast ? `${fast} fast purple ${fast === 1 ? 'drone' : 'drones'}` : 'No fast purple drones';
}
droneCountInput.addEventListener('input', () => {
  syncDroneChoice();
  updateFastDroneNote();
});
droneCountOptions.addEventListener('change', (event) => {
  droneCountInput.value = event.target.value;
  updateFastDroneNote();
});
updateFastDroneNote();

COIN_DASH_FEATURES.forEach((feature) => {
  const label = document.createElement('label');
  label.className = 'feature-option';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'feature';
  checkbox.value = feature.id;
  const copy = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = feature.label;
  const description = document.createElement('small');
  description.textContent = feature.description;
  copy.append(title, description);
  label.append(checkbox, copy);
  options.append(label);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  closeSettings();
  const selected = new Set(new FormData(form).getAll('feature'));
  const activeFeatures = COIN_DASH_FEATURES.filter((feature) => selected.has(feature.id));
  const background = new FormData(form).get('background');
  const droneCount = Math.max(COIN_DASH.minDrones,
    Math.min(COIN_DASH.maxDrones, Number(droneCountInput.value) || COIN_DASH.droneCount));
  droneCountInput.value = droneCount;
  syncDroneChoice();
  updateFastDroneNote();
  menu.hidden = true;
  gameContainer.hidden = false;
  gameControls.hidden = false;
  game = createCoinDashGame(activeFeatures, droneCount, background, (count) => {
    droneCountInput.value = count;
    syncDroneChoice();
    updateFastDroneNote();
  });
});

document.getElementById('change-features').addEventListener('click', () => {
  closeSettings();
  game.destroy(true);
  game = null;
  gameContainer.hidden = true;
  gameControls.hidden = true;
  menu.hidden = false;
  form.querySelector('button[type="submit"]').focus();
});
