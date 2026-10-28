/* global COIN_DASH */
// Add a feature here to make it available in the menu and during the game.
window.COIN_DASH_FEATURES = [
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
      const size = COIN_DASH.droneSize * (1 + progress);
      scene.drones.getChildren().forEach((drone) => {
        drone.setDisplaySize(size, size);
        drone.body.setSize(size, size, true);
      });
    }
  }
];
