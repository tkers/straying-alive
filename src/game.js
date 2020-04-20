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
  TimedSpawnComponent,
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
  TimedSpawnSystem,
  BucketSpawnSystem,
  HungrySpawnSystem,
  CullingSystem,
  GameOverScreenSystem,
  SecondChanceSystem
} from "./systems";
import { FingerSelectionSystem, FingerTargetSystem } from "./touchSystems";
import { base, enemyBase, blob, food, enemy } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const globalState = { score: 0, alive: true };
  const world = createWorld();

  const hq = world.createEntity(base).on("eat-food", ent => {
    ent.components.HungrySpawnComponent.food++;
  });
  world.createEntity(enemyBase(hq));
  world.createEntity(blob(hq));

  // debugging tools
  window.spawnEnemy = () => world.createEntity(enemy(hq));
  window.spawnBlob = () => world.createEntity(blob(hq));
  window.spawnFood = () => world.createEntity(food(hq));

  window.addEventListener("keydown", ev => {
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
  world.addSystem([SpriteComponent, SpriteFadeComponent], SpriteFadeSystem);

  // movement
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem);
  world.addSystem([VelocityComponent, WanderComponent], WanderSystem);
  world.addSystem(
    [PositionComponent, VelocityComponent, TargetComponent],
    TargetSystem
  );

  // mouse input
  world
    .addSystem(
      [ControllableComponent, PositionComponent, SpriteComponent],
      MouseSelectionSystem(canvas)
    )
    .addTag("gameplay");
  world
    .addSystem(
      [ControllableComponent, TargetComponent],
      MouseTargetSystem(canvas)
    )
    .addTag("gameplay");

  // touch input
  world
    .addSystem(
      [ControllableComponent, PositionComponent, SpriteComponent],
      FingerSelectionSystem(canvas)
    )
    .addTag("gameplay");
  world
    .addSystem(
      [ControllableComponent, PositionComponent, VelocityComponent],
      FingerTargetSystem(canvas)
    )
    .addTag("gameplay");

  // collisions
  world.addSystem([PositionComponent, SpriteComponent], FoodNomSystem(world));
  world
    .addSystem([PositionComponent, SpriteComponent], NomSystem(world))
    .addTag("gameplay");
  world
    .addSystem([PositionComponent, SpriteComponent], BadNomSystem(world))
    .addTag("gameplay");

  // lifecycle
  world.addSystem([PositionComponent], CullingSystem(-20, -20, w + 20, h + 20));
  world.addSystem([DecayComponent], DecaySystem);

  // game flow
  world
    .addSystem([TimedSpawnComponent], TimedSpawnSystem(world))
    .addTag("gameplay");
  world
    .addSystem([BucketSpawnComponent], BucketSpawnSystem(world))
    .addTag("gameplay");
  world
    .addSystem([HungrySpawnComponent], HungrySpawnSystem(world))
    .addTag("gameplay");
  world.addSystem(["blob"], SecondChanceSystem(world, blob(hq)));

  world.on("eat-food", () => {
    if (globalState.alive) {
      globalState.score += 10;
    }
  });

  world.on("eat-enemy", () => {
    if (globalState.alive) {
      globalState.score += 50;
    }
  });

  world.addGlobalSystem(GameOverScreenSystem(canvas, w, h, globalState));

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
