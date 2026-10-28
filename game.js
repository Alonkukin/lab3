/* global Phaser, COIN_DASH, COIN_DASH_SETTINGS */
class CoinDash extends Phaser.Scene {
  constructor(activeFeatures, droneCount, onDroneCountChange) {
    super('CoinDash');
    this.activeFeatures = activeFeatures;
    this.droneCount = droneCount;
    this.onDroneCountChange = onDroneCountChange;
  }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.playerSpeedBonus = 0;
    this.finished = false;
    this.paused = false;
    this.elapsedMs = 0;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24, c.colors.player);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.coins = this.physics.add.group();
    this.addCoin();
    this.drones = this.physics.add.group();
    for (let i = 0; i < this.droneCount; i++) {
      const x = this.droneCount === c.droneCount ? 90 + i * 270 : (i + 0.5) * c.width / this.droneCount;
      const y = this.droneCount === c.droneCount ? 100 : (i % 2 ? c.height - 60 : 100);
      const fast = i % c.fastDroneEvery === 1;
      const size = fast ? c.fastDroneSize : c.droneSize;
      const speed = fast ? c.fastDroneSpeed : c.droneSpeed;
      const color = fast ? c.colors.fastDrone : c.colors.drone;
      const drone = this.add.rectangle(x, y, size, size, color);
      drone.baseSize = size;
      drone.baseSpeed = speed;
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => {
      if (this.finished) return;
      this.score++;
      this.activeFeatures.forEach((feature) => feature.onCoinCollected?.(this));
      this.placeCoin(coin);
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    const restart = () => this.scene.restart();
    const togglePause = () => this.togglePause();
    const adjustDrones = (event) => {
      if (this.paused) return;
      if (event.key === '+' || event.key === '=') this.changeDrones(1);
      if (event.key === '-' || event.key === '_') this.changeDrones(-1);
    };
    this.input.keyboard.on('keydown-R', restart);
    this.input.keyboard.on('keydown-P', togglePause);
    this.input.keyboard.on('keydown-ESC', togglePause);
    this.input.keyboard.on('keydown', adjustDrones);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard.off('keydown-R', restart);
      this.input.keyboard.off('keydown-P', togglePause);
      this.input.keyboard.off('keydown-ESC', togglePause);
      this.input.keyboard.off('keydown', adjustDrones);
    });
  }

  togglePause() {
    if (this.finished) return;
    const c = COIN_DASH;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.pauseOverlay = this.add.container(c.width / 2, c.height / 2, [
        this.add.rectangle(0, 0, 460, 130, 0x0a1120, 0.95),
        this.add.text(0, 0, 'Paused\nPress P or Esc to continue',
          { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }).setOrigin(0.5)
      ]);
    } else {
      this.physics.resume();
      this.pauseOverlay.destroy();
    }
  }

  addCoin() {
    const coin = this.add.circle(0, 0, 9, COIN_DASH.colors.coin);
    this.coins.add(coin);
    coin.body.setCircle(9);
    this.placeCoin(coin);
  }

  changeDrones(delta) {
    const count = Phaser.Math.Clamp(this.droneCount + delta, COIN_DASH.minDrones, COIN_DASH.maxDrones);
    if (count === this.droneCount) return;
    this.droneCount = count;
    this.onDroneCountChange(count);
    this.scene.restart();
  }

  placeCoin(coin) {
    const c = COIN_DASH;
    // Keep coins away from the player and each other when they spawn.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60 ||
      this.coins.getChildren().some((other) => other !== coin &&
        Phaser.Math.Distance.Between(x, y, other.x, other.y) < 36));
    coin.setPosition(x, y);
    coin.body.reset(x, y);
  }

  update(_time, delta) {
    if (this.finished || this.paused) return;
    this.elapsedMs += delta;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize()
      .scale(COIN_DASH_SETTINGS.playerSpeed + this.playerSpeedBonus);
    this.player.body.setVelocity(direction.x, direction.y);
    const progress = Phaser.Math.Clamp(this.elapsedMs / (COIN_DASH.roundSeconds * 1000), 0, 1);
    this.activeFeatures.forEach((feature) => feature.update?.(this, progress));
    const seconds = Math.max(0, Math.ceil((COIN_DASH.roundSeconds * 1000 - this.elapsedMs) / 1000));
    this.hud.setText(`Coins: ${this.score}          Drones: ${this.droneCount}          Time: ${seconds}s`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    const c = COIN_DASH;
    this.add.rectangle(c.width / 2, c.height / 2, 460, 150, 0x0a1120, 0.95);
    this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\nPress R to try again`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.createCoinDashGame = function (activeFeatures, droneCount, onDroneCountChange) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: COIN_DASH.width,
    height: COIN_DASH.height,
    backgroundColor: COIN_DASH.colors.background,
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
    scene: new CoinDash(activeFeatures, droneCount, onDroneCountChange)
  });
};
