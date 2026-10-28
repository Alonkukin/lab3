// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneSize: 26,
  droneCount: 3,
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};

// These values can change while a round is running.
window.COIN_DASH_SETTINGS = {
  playerSpeed: window.COIN_DASH.playerSpeed,
  droneGrowthRate: 1
};
