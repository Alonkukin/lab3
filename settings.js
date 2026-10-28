// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneSize: 26,
  // Every third drone (the 2nd, 5th, 8th) is a smaller, faster one.
  fastDroneSpeed: 190,
  fastDroneSize: 18,
  fastDroneEvery: 3,
  droneCount: 3,
  minDrones: 1,
  maxDrones: 8,
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a, fastDrone: 0xc77dff }
};
