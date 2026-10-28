/* global COIN_DASH, COIN_DASH_FEATURES, createCoinDashGame */
const menu = document.getElementById('menu');
const form = document.getElementById('feature-form');
const options = document.getElementById('feature-options');
const gameContainer = document.getElementById('game');
const gameControls = document.getElementById('game-controls');
const droneCountInput = document.getElementById('drone-count');
let game = null;

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
  game.destroy(true);
  game = null;
  gameContainer.hidden = true;
  gameControls.hidden = true;
  menu.hidden = false;
  form.querySelector('button[type="submit"]').focus();
});
