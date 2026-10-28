/* global COIN_DASH_FEATURES, createCoinDashGame */
const menu = document.getElementById('menu');
const form = document.getElementById('feature-form');
const options = document.getElementById('feature-options');
const gameContainer = document.getElementById('game');
const gameControls = document.getElementById('game-controls');
let game = null;

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
  game = createCoinDashGame(activeFeatures);
});

document.getElementById('change-features').addEventListener('click', () => {
  game.destroy(true);
  game = null;
  gameContainer.hidden = true;
  gameControls.hidden = true;
  menu.hidden = false;
  form.querySelector('button[type="submit"]').focus();
});
