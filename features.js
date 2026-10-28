// Add a feature here to make it available in the menu and during the game.
window.COIN_DASH_FEATURES = [
  {
    id: 'faster-drones',
    label: 'Drones get faster',
    description: 'Drone speed doubles gradually over the round.',
    update(scene, progress) {
      scene.drones.getChildren().forEach((drone) => {
        drone.body.velocity.setLength(drone.getData('baseSpeed') * (1 + progress));
      });
    }
  },
  {
    id: 'bigger-drones',
    label: 'Drones get bigger',
    description: 'Drone size doubles gradually over the round.',
    update(scene, progress) {
      scene.drones.getChildren().forEach((drone) => {
        const size = drone.getData('baseSize') * (1 + progress);
        drone.setDisplaySize(size, size);
        drone.body.setSize(size, size, true);
      });
    }
  }
];
