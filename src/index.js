import { createGame } from "./game.js";

const gameLoop = cb => {
  let isPaused = false;
  let pt = 0;
  const tick = t => {
    const dt = (t - pt) / 1000;
    pt = t;
    !isPaused && cb(dt);
    requestAnimationFrame(tick);
  };

  tick(0);

  return {
    pause: () => {
      isPaused = !isPaused;
      return isPaused;
    }
  };
};

window.addEventListener("load", () => {
  const root = document.getElementById("root");
  const game = createGame(root);
  const loop = gameLoop(game.update);

  window.addEventListener("keydown", e => {
    if (e.key === " ") {
      root.style.opacity = loop.pause() ? 0.5 : 1;
    }
  });
});
