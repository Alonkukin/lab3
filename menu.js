/* global COIN_DASH, COIN_DASH_FEATURES, COIN_DASH_SETTINGS, createCoinDashGame */
const menu = document.getElementById('menu');
const form = document.getElementById('feature-form');
const options = document.getElementById('feature-options');
const gameContainer = document.getElementById('game');
const gameControls = document.getElementById('game-controls');
const droneCountInput = document.getElementById('drone-count');
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
  const droneCount = Math.max(COIN_DASH.minDrones,
    Math.min(COIN_DASH.maxDrones, Number(droneCountInput.value) || COIN_DASH.droneCount));
  droneCountInput.value = droneCount;
  menu.hidden = true;
  gameContainer.hidden = false;
  gameControls.hidden = false;
  game = createCoinDashGame(activeFeatures, droneCount, (count) => { droneCountInput.value = count; });
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
