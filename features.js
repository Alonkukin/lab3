/* global COIN_DASH, COIN_DASH_SETTINGS */
// Add a feature here to make it available in the menu and during the game.
window.COIN_DASH_FEATURES = [
  {
    id: 'more-coins',
    label: 'More coins over time',
    description: 'An extra coin appears every 9 seconds, up to five at once.',
    update(scene, progress) {
      const target = Math.min(5, 1 + Math.floor(progress * 5));
      while (scene.coins.getChildren().length < target) scene.addCoin();
    }
  },
  {
    id: 'coin-speed',
    label: 'Get faster with every coin',
    description: 'Each coin adds 10 px/s to your movement speed.',
    onCoinCollected(scene) {
      scene.playerSpeedBonus = scene.score * 10;
    }
  },
  {
    id: 'level-colors',
    label: 'Change color every 5 coins',
    description: 'Your player changes color at 5, 10, 15 coins, and every 5 after that.',
    onCoinCollected(scene) {
      if (scene.score % 5 !== 0) return;
      const colors = [0x70a7ff, 0xb48aff, 0xffa45e, 0xff78b5, 0xa4ee72];
      scene.player.setFillStyle(colors[(scene.score / 5 - 1) % colors.length]);
    }
  },
  {
    id: 'faster-drones',
    label: 'Drones get faster',
    description: 'Drone speed doubles gradually over the round.',
    update(scene, progress) {
      const speed = COIN_DASH.droneSpeed * (1 + progress);
      scene.drones.getChildren().forEach((drone) => {
        drone.body.velocity.setLength(speed);
      });
    }
  },
  {
    id: 'bigger-drones',
    label: 'Drones get bigger',
    description: 'Drone size doubles gradually over the round.',
    update(scene, progress) {
      const growth = Math.min(progress * COIN_DASH_SETTINGS.droneGrowthRate, 1);
      const size = COIN_DASH.droneSize * (1 + growth);
      scene.drones.getChildren().forEach((drone) => {
        drone.setDisplaySize(size, size);
        drone.body.setSize(size, size, true);
      });
    }
  }
];
