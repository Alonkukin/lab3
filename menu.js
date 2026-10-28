/* global COIN_DASH, COIN_DASH_FEATURES, createCoinDashGame */
const menu = document.getElementById('menu');
const form = document.getElementById('feature-form');
const options = document.getElementById('feature-options');
const gameContainer = document.getElementById('game');
const gameControls = document.getElementById('game-controls');
const droneCountOptions = document.getElementById('drone-count-options');
const fastDroneNote = document.getElementById('fast-drone-note');
let game = null;

for (let n = COIN_DASH.minDrones; n <= COIN_DASH.maxDrones; n++) {
  const label = document.createElement('label');
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'drones';
  radio.value = n;
  radio.checked = n === COIN_DASH.droneCount;
  const number = document.createElement('span');
  number.textContent = n;
  label.append(radio, number);
  droneCountOptions.append(label);
}

// Every fastDroneEvery-th drone, starting with the second, is a fast one (see game.js).
function updateFastDroneNote() {
  const count = Number(new FormData(form).get('drones'));
  const fast = Math.floor((count + COIN_DASH.fastDroneEvery - 2) / COIN_DASH.fastDroneEvery);
  fastDroneNote.textContent = fast ? `${fast} of them fast (small purple)` : 'No fast drones';
}
droneCountOptions.addEventListener('change', updateFastDroneNote);
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
  const selected = new Set(new FormData(form).getAll('feature'));
  const activeFeatures = COIN_DASH_FEATURES.filter((feature) => selected.has(feature.id));
  menu.hidden = true;
  gameContainer.hidden = false;
  gameControls.hidden = false;
  game = createCoinDashGame(activeFeatures, Number(new FormData(form).get('drones')));
});

document.getElementById('change-features').addEventListener('click', () => {
  game.destroy(true);
  game = null;
  gameContainer.hidden = true;
  gameControls.hidden = true;
  menu.hidden = false;
  form.querySelector('button[type="submit"]').focus();
});
