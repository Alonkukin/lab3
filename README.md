# Coin Dash — Lab 3 starter

Collect coins, avoid drones, and survive a 45-second round. Move with arrow keys or WASD;
press R to restart. This is deliberately small so you can add features during the lab.
Before each game, select any combination of features and press Start game. Leave every option
unchecked to play the original game. Use Change features to return to the menu.
Choose one of three arena backgrounds on the start menu: Midnight Grid, Neon Circuit, or
Sunset Run. The chosen background stays in place when you restart a round; returning to the
menu lets you choose another. The Coin Dash logo is stored in `logo.svg`.
Open Settings before or during a game to adjust player speed and drone growth rate. The round
pauses while Settings is open, and changes take effect when you resume. Drone growth rate only
affects rounds with the “Drones get bigger” feature selected.
Choose between 1 and 8 drones in the same menu; the default is 3. Press + or − during a game
to change the count and start a fresh round.
Press P or Esc to pause or resume the round.
With the default count, one of the three drones is smaller, purple, and faster. Selected drone speed
or size modifiers preserve each drone's starting speed and size difference.

Every five coins, the round pauses and offers two random abilities. Press 1 or 2, or click an offer:

- **Extra life:** adds one life. The game continues after a drone hit until all lives are lost.
- **Phase:** pass through drones for 10 seconds. The HUD shows the remaining time.
- **Coin teleport:** jump to the nearest coin every five seconds for the rest of the round. Each jump grants one second of drone immunity. Once chosen, this ability is removed from later offers.

The HUD shows lives, phase time, and the next teleport. After a nonfatal drone hit, the player also gets one second of immunity to avoid losing several lives in a single collision.

**Play it here:** https://www.avivz.net/coin-dash/

## Run it locally

Clone the repository and open `index.html` in a browser. Everything is in the repository;
there is no package to install, no build step, no backend, and nothing is fetched from the network.
If your agent prefers a local server, let it serve this folder, for example with
`python3 -m http.server 8000`, and open `http://localhost:8000`.

## Use it in the lab

This is a template repository. One partner creates the pair's own repository from it
(the **Use this template** button, or `gh repo create <name> --template avivz/coin-dash --public --clone`)
and adds the other partner as a collaborator. Both clone it and open `index.html`.

## Lab report

The repository includes a `lab-report` skill: use `/lab-report` in Claude Code or `$lab-report`
in Codex, for the pre-lab practice run and at the end of the lab. Give it your name, a unique
laptop label, and the session's start and end times with timezone. If it is not listed, ask
your agent to read `.claude/skills/lab-report/SKILL.md` and follow it.

The skill writes a JSON export and a report page under `reports/`, which Git ignores.
Open that page, load your JSON, and check the result. For the final pair report, load both
laptops' JSON files together and save the combined HTML. Use the same time window on both laptops.

## Files

- `.claude/skills/lab-report/`: reporting skill and offline HTML page.
- `.agents/skills/lab-report`: link to the same skill for Codex.
- `.gitignore`: keeps generated reports out of Git.
- `index.html`: page and script loading.
- `style.css`: page appearance.
- `logo.svg`: scalable game logo.
- `settings.js`: round duration, colours, dimensions and live settings values.
- `features.js`: available menu options and their effects during a round. Add an entry with a
  unique `id`, `label`, `description`, and either `update(scene, progress)` for continuous effects
  or `onCoinCollected(scene)` for effects triggered by collecting a coin.
- `menu.js`: feature selection and game startup.
- `game.js`: scene, input, collisions, score and end-of-round behaviour.
- `vendor/phaser-3.90.0.min.js`: the pinned Phaser runtime, byte for byte the file published at
  `https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js`; `vendor/LICENSE.phaser.txt` is its MIT licence.

The game draws its own shapes; there are no image or audio assets. The authored files are under the
MIT licence in LICENSE.txt. Phaser documentation:
https://docs.phaser.io/phaser/getting-started/making-your-first-phaser-game

## Team

- Yehonatan Shvimmer
