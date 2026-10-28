/* global Phaser, COIN_DASH, COIN_DASH_SETTINGS */
class CoinDash extends Phaser.Scene {
  constructor(activeFeatures, droneCount, background, onDroneCountChange) {
    super('CoinDash');
    this.activeFeatures = activeFeatures;
    this.droneCount = droneCount;
    this.background = background;
    this.onDroneCountChange = onDroneCountChange;
  }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.lives = 1;
    this.playerSpeedBonus = 0;
    this.finished = false;
    this.paused = false;
    this.choosingAbility = false;
    this.elapsedMs = 0;
    this.phaseUntil = 0;
    this.immuneUntil = 0;
    this.teleportEnabled = false;
    this.nextTeleportAt = 0;
    this.physics.world.setBounds(0, 68, c.width, c.height - 68);
    this.drawBackground();
    this.add.rectangle(c.width / 2, 34, c.width, 68, 0x0a1120, 0.86);
    this.hud = this.add.text(18, 8, '', { font: '17px monospace', color: '#ffffff', lineSpacing: 4 });
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
      if (this.finished || this.choosingAbility) return;
      this.score++;
      this.activeFeatures.forEach((feature) => feature.onCoinCollected?.(this));
      this.placeCoin(coin);
      if (this.score % 5 === 0) this.offerAbility();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.hitByDrone());
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

  drawBackground() {
    const { width, height } = COIN_DASH;
    const art = this.add.graphics();
    if (this.background === 'neon') {
      art.fillStyle(0x100d2b).fillRect(0, 0, width, height);
      art.lineStyle(1, 0x4e327b, 0.45);
      for (let x = 0; x <= width; x += 40) art.lineBetween(x, 0, x, height);
      for (let y = 0; y <= height; y += 40) art.lineBetween(0, y, width, y);
      art.lineStyle(3, 0x31dcd2, 0.36);
      for (let i = 0; i < 5; i++) {
        const y = 105 + i * 78;
        art.lineBetween(0, y, 110 + i * 22, y);
        art.lineBetween(110 + i * 22, y, 155 + i * 22, y + 24);
        art.lineBetween(155 + i * 22, y + 24, width, y + 24);
        art.fillStyle(0x71e8ce, 0.72).fillCircle(110 + i * 22, y, 4);
        art.fillStyle(0xc77dff, 0.75).fillCircle(155 + i * 22, y + 24, 4);
      }
      art.lineStyle(3, 0xc77dff, 0.5).strokeRect(12, 80, width - 24, height - 92);
    } else if (this.background === 'sunset') {
      art.fillStyle(0x292044).fillRect(0, 0, width, height);
      art.fillStyle(0x51304f).fillRect(0, 95, width, 170);
      art.fillStyle(0x7c4056).fillRect(0, 265, width, 100);
      art.fillStyle(0xffbd77, 0.64).fillCircle(590, 180, 92);
      art.fillStyle(0xffd69a, 0.55).fillCircle(590, 180, 69);
      art.fillStyle(0x332641).fillTriangle(0, 310, 215, 170, 415, 310);
      art.fillTriangle(305, 315, 535, 195, 800, 315);
      art.fillStyle(0x1d233b).fillRect(0, 320, width, height - 320);
      art.lineStyle(2, 0xe88783, 0.38);
      for (let y = 340; y < height; y += 34) art.lineBetween(0, y, width, y);
      for (let x = -320; x <= 1120; x += 160) art.lineBetween(400, 320, x, height);
    } else {
      art.fillStyle(COIN_DASH.colors.background).fillRect(0, 0, width, height);
      art.lineStyle(1, 0x30435f, 0.48);
      for (let x = 0; x <= width; x += 40) art.lineBetween(x, 0, x, height);
      for (let y = 0; y <= height; y += 40) art.lineBetween(0, y, width, y);
    }
  }

  togglePause() {
    if (this.finished || this.choosingAbility) return;
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

  offerAbility() {
    const abilities = [
      { label: '+1 life', description: 'Survive one more drone hit.', apply: () => { this.lives++; } },
      { label: 'Phase', description: 'Pass through drones for 10 seconds.',
        apply: () => { this.phaseUntil = this.elapsedMs + 10000; } }
    ];
    if (!this.teleportEnabled) abilities.push({
      label: 'Coin teleport',
      description: 'Jump to the closest coin every 5 seconds. Each jump grants 1 second of immunity.',
      apply: () => {
        this.teleportEnabled = true;
        this.nextTeleportAt = this.elapsedMs + 5000;
      }
    });
    const first = Phaser.Math.Between(0, abilities.length - 1);
    const choices = [abilities.splice(first, 1)[0], abilities[Phaser.Math.Between(0, abilities.length - 1)]];
    this.choosingAbility = true;
    this.physics.pause();
    const c = COIN_DASH;
    const overlay = this.add.container(c.width / 2, c.height / 2);
    overlay.add(this.add.rectangle(0, 0, 650, 250, 0x0a1120, 0.97));
    overlay.add(this.add.text(0, -96, 'Choose an ability',
      { font: '25px monospace', color: '#ffffff' }).setOrigin(0.5));
    choices.forEach((choice, index) => {
      const y = -42 + index * 90;
      const option = this.add.text(-292, y,
        `${index + 1}. ${choice.label}\n${choice.description}`,
        { font: '17px monospace', color: '#71e8ce', wordWrap: { width: 580 }, lineSpacing: 4 });
      option.setInteractive({ useHandCursor: true });
      option.on('pointerdown', () => select(index));
      overlay.add(option);
    });
    const select = (index) => {
      if (!this.choosingAbility) return;
      this.choosingAbility = false;
      cleanup();
      overlay.destroy();
      choices[index].apply();
      this.physics.resume();
    };
    const cleanup = () => {
      this.input.keyboard.off('keydown', chooseWithKey);
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    };
    const chooseWithKey = (event) => {
      if (event.key === '1') select(0);
      if (event.key === '2') select(1);
    };
    this.input.keyboard.on('keydown', chooseWithKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  }

  hitByDrone() {
    if (this.finished || this.choosingAbility || this.elapsedMs < this.phaseUntil ||
        this.elapsedMs < this.immuneUntil) return;
    this.lives--;
    if (this.lives === 0) {
      this.finish('A drone caught you!');
      return;
    }
    this.immuneUntil = this.elapsedMs + 1000;
  }

  teleportToClosestCoin() {
    const coin = this.coins.getChildren().reduce((closest, candidate) =>
      !closest || Phaser.Math.Distance.Between(this.player.x, this.player.y, candidate.x, candidate.y) <
        Phaser.Math.Distance.Between(this.player.x, this.player.y, closest.x, closest.y)
        ? candidate : closest, null);
    if (!coin) return;
    this.player.body.reset(coin.x, coin.y);
    this.immuneUntil = this.elapsedMs + 1000;
  }

  update(_time, delta) {
    if (this.finished || this.paused || this.choosingAbility) return;
    this.elapsedMs += delta;
    if (this.teleportEnabled && this.elapsedMs >= this.nextTeleportAt) {
      this.nextTeleportAt = this.elapsedMs + 5000;
      this.teleportToClosestCoin();
    }
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize()
      .scale(COIN_DASH_SETTINGS.playerSpeed + this.playerSpeedBonus);
    this.player.body.setVelocity(direction.x, direction.y);
    this.player.setAlpha(this.elapsedMs < this.phaseUntil ? 0.45 :
      this.elapsedMs < this.immuneUntil ? 0.7 : 1);
    const progress = Phaser.Math.Clamp(this.elapsedMs / (COIN_DASH.roundSeconds * 1000), 0, 1);
    this.activeFeatures.forEach((feature) => feature.update?.(this, progress));
    const seconds = Math.max(0, Math.ceil((COIN_DASH.roundSeconds * 1000 - this.elapsedMs) / 1000));
    const phase = Math.max(0, Math.ceil((this.phaseUntil - this.elapsedMs) / 1000));
    const teleport = this.teleportEnabled
      ? `${Math.max(0, Math.ceil((this.nextTeleportAt - this.elapsedMs) / 1000))}s`
      : 'off';
    this.hud.setText(`Coins: ${this.score}    Lives: ${this.lives}    Drones: ${this.droneCount}    Time: ${seconds}s\nPhase: ${phase}s    Teleport: ${teleport}`);
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
window.createCoinDashGame = function (activeFeatures, droneCount, background, onDroneCountChange) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: COIN_DASH.width,
    height: COIN_DASH.height,
    backgroundColor: COIN_DASH.colors.background,
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
    scene: new CoinDash(activeFeatures, droneCount, background, onDroneCountChange)
  });
};
