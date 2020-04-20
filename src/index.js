import { createGame } from "./game.js";
import gameLoop from "./gameloop";

let root;
let game;
const resetGame = () => {
  game = createGame(root, resetGame);
};

window.addEventListener("load", () => {
  root = document.getElementById("root");
  resetGame();
  gameLoop(dt => game.update(dt));
});

// debugging tools
window.addEventListener("keydown", ev => {
  if (!ev.ctrlKey) return;
  if (ev.key === "e") {
    window.spawnEnemy();
  }
  if (ev.key === "b") {
    window.spawnBlob();
  }
  if (ev.key === "f") {
    window.spawnFood();
  }
});
