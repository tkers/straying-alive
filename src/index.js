import { createGame } from "./game.js";

let running = true;
const gameLoop = cb => {
  let pt = 0;
  const tick = t => {
    const dt = (t - pt) / 1000;
    pt = t;
    running && cb(dt);
    requestAnimationFrame(tick);
  };

  tick(0);
};

window.addEventListener("keydown", e => {
  if (e.key === " ") {
    running = !running;
    document.getElementById("root").style.opacity = running ? 1 : 0.5;
  }
});

window.addEventListener("load", () => {
  const game = createGame(document.getElementById("root"));
  gameLoop(game.update);
});
