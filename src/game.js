import { createWorld } from "./ecs";
import {
  SpriteComponent,
  SpriteFadeComponent,
  DecayComponent,
  PositionComponent,
  VelocityComponent,
  TargetComponent,
  WanderComponent,
  ControllableComponent,
  DelayedSpawnComponent,
  BucketSpawnComponent,
  HungrySpawnComponent
} from "./components";
import {
  RenderSystem,
  SpriteFadeSystem,
  DecaySystem,
  MovementSystem,
  TargetSystem,
  WanderSystem,
  MouseSelectionSystem,
  MouseTargetSystem,
  FoodNomSystem,
  NomSystem,
  BadNomSystem,
  DelayedSpawnSystem,
  BucketSpawnSystem,
  HungrySpawnSystem,
  CullingSystem,
  PauseSystem,
  GameOverScreenSystem,
  TitleScreenSystem,
  SecondChanceSystem
} from "./systems";
import { FingerControlSystem } from "./touchSystems";
import { base, enemyBase, blob, food, enemy } from "./assemblages";

const WIDTH = 960;
const HEIGHT = 640;

export const createGame = (canvas, resetGame) => {
  const globalState = { score: 0, alive: true };
  const world = createWorld();

  const hq = world.createEntity(base);
  world.on("begin", () => {
    world.createEntity(enemyBase(hq));
    world.createEntity(blob(hq));
  });

  // debugging tools
  window.spawnEnemy = () => world.createEntity(enemy(hq));
  window.spawnBlob = () => world.createEntity(blob(hq));
  window.spawnFood = () => world.createEntity(food(hq));

  // visuals
  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, WIDTH, HEIGHT, globalState)
  );
  world
    .addSystem([SpriteComponent, SpriteFadeComponent], SpriteFadeSystem)
    .addTag("pausable");

  // movement
  world
    .addSystem([PositionComponent, VelocityComponent], MovementSystem)
    .addTag("pausable");
  world
    .addSystem([VelocityComponent, WanderComponent], WanderSystem)
    .addTag("pausable");
  world
    .addSystem(
      [PositionComponent, VelocityComponent, TargetComponent],
      TargetSystem
    )
    .addTag("pausable");

  // mouse input
  world
    .addSystem(
      [ControllableComponent, PositionComponent, SpriteComponent],
      MouseSelectionSystem(canvas)
    )
    .addTag("gameplay")
    .addTag("pausable");
  world
    .addSystem(
      [ControllableComponent, TargetComponent],
      MouseTargetSystem(canvas)
    )
    .addTag("gameplay")
    .addTag("pausable");

  // touch input
  world
    .addSystem(
      [ControllableComponent, PositionComponent, SpriteComponent],
      FingerControlSystem(canvas)
    )
    .addTag("gameplay")
    .addTag("pausable");

  // collisions
  world
    .addSystem([PositionComponent, SpriteComponent], FoodNomSystem(world))
    .addTag("pausable");
  world
    .addSystem([PositionComponent, SpriteComponent], NomSystem(world))
    .addTag("gameplay");
  world
    .addSystem([PositionComponent, SpriteComponent], BadNomSystem(world))
    .addTag("gameplay")
    .addTag("pausable");

  // lifecycle
  world.addSystem(
    [PositionComponent],
    CullingSystem(-20, -20, WIDTH + 20, HEIGHT + 20)
  );
  world.addSystem([DecayComponent], DecaySystem).addTag("pausable");

  // game flow
  world
    .addSystem([DelayedSpawnComponent], DelayedSpawnSystem(world))
    .addTag("gameplay")
    .addTag("pausable");
  world
    .addSystem([BucketSpawnComponent], BucketSpawnSystem(world))
    .addTag("gameplay")
    .addTag("pausable");
  world
    .addSystem([HungrySpawnComponent], HungrySpawnSystem(world))
    .addTag("gameplay")
    .addTag("pausable");
  world.on("begin", () => {
    world
      .addSystem(["blob"], SecondChanceSystem(hq, blob(hq)))
      .addTag("pausable");
  });

  // scoring
  world.on("eat-food", () => {
    if (globalState.alive) {
      globalState.score += 10;
      world.emit("score-change", globalState.score);
    }
  });

  world.on("eat-enemy", () => {
    if (globalState.alive) {
      globalState.score += 50;
      world.emit("score-change", globalState.score);
    }
  });

  // game state changes
  world.addGlobalSystem(TitleScreenSystem(world, canvas, WIDTH, HEIGHT));
  world.addGlobalSystem(
    GameOverScreenSystem(canvas, WIDTH, HEIGHT, globalState)
  );
  world.on("begin", () => {
    world.addGlobalSystem(PauseSystem(world, canvas, WIDTH, HEIGHT));
  });

  world.on("game-over", () => {
    if (!globalState.alive) return;

    globalState.alive = false;
    world.getSystems("gameplay").forEach(s => s.pause());

    globalState.highScore = window.localStorage.getItem("highscore");
    if (globalState.score > globalState.highScore) {
      window.localStorage.setItem("highscore", globalState.score);
    }

    const handleRestart = () => {
      window.removeEventListener("mousedown", handleRestart);
      resetGame();
    };
    setTimeout(() => {
      window.addEventListener("mousedown", handleRestart, false);
    }, 1000);
  });

  return world;
};
