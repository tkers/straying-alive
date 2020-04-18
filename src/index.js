import { createGame } from "./game.js";

const gameLoop = cb => {
  let pt = 0;
  const tick = t => {
    const dt = (t - pt) / 1000;
    pt = t;
    cb(dt);
    requestAnimationFrame(tick);
  };

  tick(0);
};

window.addEventListener("load", () => {
  const game = createGame(document.getElementById("root"));
  gameLoop(game.update);
});
