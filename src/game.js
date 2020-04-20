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
  SecondChanceSystem
} from "./systems";
import { FingerSelectionSystem, FingerTargetSystem } from "./touchSystems";
import { base, enemyBase, blob, food, enemy } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const globalState = { score: 0, alive: true };
  const world = createWorld();

  const hq = world.createEntity(base);
  world.createEntity(enemyBase(hq));
  world.createEntity(blob(hq));

  // debugging tools
  window.spawnEnemy = () => world.createEntity(enemy(hq));
  window.spawnBlob = () => world.createEntity(blob(hq));
  window.spawnFood = () => world.createEntity(food(hq));

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

  // visuals
  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, w, h, globalState)
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
      FingerSelectionSystem(canvas)
    )
    .addTag("gameplay")
    .addTag("pausable");
  world
    .addSystem(
      [ControllableComponent, PositionComponent, VelocityComponent],
      FingerTargetSystem(canvas)
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
  world.addSystem([PositionComponent], CullingSystem(-20, -20, w + 20, h + 20));
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
  world
    .addSystem(["blob"], SecondChanceSystem(hq, blob(hq)))
    .addTag("pausable");

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
  world.addGlobalSystem(GameOverScreenSystem(canvas, w, h, globalState));
  world.addGlobalSystem(PauseSystem(world, canvas, w, h));

  world.on("game-over", () => {
    if (!globalState.alive) return;

    globalState.alive = false;
    world.getSystems("gameplay").forEach(s => s.pause());

    globalState.highScore = window.localStorage.getItem("highscore");
    if (globalState.score > globalState.highScore) {
      window.localStorage.setItem("highscore", globalState.score);
    }
  });

  return world;
};
