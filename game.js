/* global Phaser, COIN_DASH */
// Shown before every round so the player can pick how many drones to face.
class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const c = COIN_DASH;
    this.choice = this.registry.get('droneCount') ?? c.droneCount;
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.add.text(c.width / 2, 110, 'COIN DASH', { font: 'bold 44px monospace', color: '#ffffff' })
      .setOrigin(0.5);
    this.add.text(c.width / 2, 180, 'How many drones?', { font: '24px monospace', color: '#ffffff' })
      .setOrigin(0.5);
    const size = 56, gap = 12, total = c.maxDrones - c.minDrones + 1;
    const left = c.width / 2 - (total * size + (total - 1) * gap) / 2 + size / 2;
    this.options = [];
    for (let n = c.minDrones; n <= c.maxDrones; n++) {
      const x = left + (n - c.minDrones) * (size + gap);
      const box = this.add.rectangle(x, 260, size, size, 0x0a1120).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, 260, String(n), { font: 'bold 26px monospace' }).setOrigin(0.5);
      box.on('pointerdown', () => { this.select(n); this.startRound(); });
      box.on('pointerover', () => this.select(n));
      this.options.push({ n, box, label });
    }
    this.add.text(c.width / 2, 315, '', { font: '16px monospace', color: '#c77dff' })
      .setOrigin(0.5).setName('fastNote');
    this.add.text(c.width / 2, 370,
      '← / → to choose · Enter or Space to start\nor click a number',
      { font: '18px monospace', color: '#9fb0c8', align: 'center', lineSpacing: 8 }).setOrigin(0.5);
    const keys = this.input.keyboard;
    keys.on('keydown-LEFT', () => this.select(this.choice - 1));
    keys.on('keydown-A', () => this.select(this.choice - 1));
    keys.on('keydown-RIGHT', () => this.select(this.choice + 1));
    keys.on('keydown-D', () => this.select(this.choice + 1));
    keys.on('keydown-ENTER', () => this.startRound());
    keys.on('keydown-SPACE', () => this.startRound());
    this.select(this.choice);
  }

  select(n) {
    const c = COIN_DASH;
    this.choice = Phaser.Math.Clamp(n, c.minDrones, c.maxDrones);
    for (const { n: value, box, label } of this.options) {
      const active = value === this.choice;
      box.setStrokeStyle(3, active ? c.colors.drone : 0x34445e);
      box.setFillStyle(active ? 0x2a1724 : 0x0a1120);
      label.setColor(active ? '#ff657a' : '#e5edf7');
    }
    const fast = Math.floor((this.choice + c.fastDroneEvery - 2) / c.fastDroneEvery);
    this.children.getByName('fastNote')
      .setText(fast ? `${fast} of them fast (small purple)` : 'No fast drones');
  }

  startRound() {
    this.registry.set('droneCount', this.choice);
    this.scene.start('CoinDash');
  }
}

class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.finished = false;
    this.paused = false;
    // Chosen in the menu; the registry keeps it between rounds.
    this.droneCount = this.registry.get('droneCount') ?? c.droneCount;
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24, c.colors.player);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.coin = this.add.circle(100, 100, 9, c.colors.coin);
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.placeCoin();
    this.drones = this.physics.add.group();
    for (let i = 0; i < this.droneCount; i++) {
      // Spread drones across the width, alternating top and bottom, away from the player.
      const x = (i + 0.5) * c.width / this.droneCount;
      const y = i % 2 ? c.height - 60 : 100;
      const fast = i % c.fastDroneEvery === 1;
      const size = fast ? 18 : 26;
      const speed = fast ? c.fastDroneSpeed : c.droneSpeed;
      const drone = this.add.rectangle(x, y, size, size, fast ? c.colors.fastDrone : c.colors.drone);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.start('Menu'));
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
  }

  togglePause() {
    if (this.finished) return;
    const c = COIN_DASH;
    this.paused = !this.paused;
    if (this.paused) {
      this.pausedAt = this.time.now;
      this.physics.pause();
      this.pauseOverlay = this.add.container(c.width / 2, c.height / 2, [
        this.add.rectangle(0, 0, 460, 130, 0x0a1120, 0.95),
        this.add.text(0, 0, 'Paused\nPress P or Esc to continue',
          { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }).setOrigin(0.5)
      ]);
    } else {
      // Push the deadline back so time spent paused doesn't count against the round.
      this.deadline += this.time.now - this.pausedAt;
      this.physics.resume();
      this.pauseOverlay.destroy();
    }
  }

  placeCoin() {
    const c = COIN_DASH;
    // Avoid spawning the next coin directly underneath the player.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  update() {
    if (this.finished || this.paused) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(COIN_DASH.playerSpeed);
    this.player.body.setVelocity(direction.x, direction.y);
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
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
      `${reason}\n${this.score} coins collected\nPress R for the menu`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.colors.background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: [Menu, CoinDash]
});
