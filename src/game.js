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
  CullingSystem
} from "./systems";
import { FingerSelectionSystem, FingerTargetSystem } from "./touchSystems";
import { base, enemyBase, blob, food, enemy } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const globalState = { score: 0 };
  const world = createWorld();

  const hq = world.createEntity(base);
  world.createEntity(enemyBase(hq));
  setTimeout(() => {
    world.createEntity(blob(hq));
  }, 200);

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
    [PositionComponent],
    CullingSystem(-20, -20, canvas.width + 20, canvas.height + 20)
  );
  world.addSystem(
    [PositionComponent, VelocityComponent, TargetComponent],
    TargetSystem
  );

  // mouse input
  world.addSystem(
    [ControllableComponent, PositionComponent, SpriteComponent],
    MouseSelectionSystem(canvas)
  );
  world.addSystem(
    [ControllableComponent, TargetComponent],
    MouseTargetSystem(canvas)
  );

  // touch input
  world.addSystem(
    [ControllableComponent, PositionComponent, SpriteComponent],
    FingerSelectionSystem(canvas)
  );
  world.addSystem(
    [ControllableComponent, PositionComponent, VelocityComponent],
    FingerTargetSystem(canvas)
  );

  // collisions
  world.addSystem(
    [PositionComponent, SpriteComponent],
    FoodNomSystem(world, hq)
  );
  world.addSystem([PositionComponent, SpriteComponent], NomSystem(world));
  world.addSystem([PositionComponent, SpriteComponent], BadNomSystem);
  world.addSystem([DecayComponent], DecaySystem);

  // game flow
  world.addSystem([TimedSpawnComponent], TimedSpawnSystem(world));
  world.addSystem([BucketSpawnComponent], BucketSpawnSystem(world));
  world.addSystem([HungrySpawnComponent], HungrySpawnSystem(world));

  world.on("eat-food", () => {
    globalState.score += 10;
  });

  world.on("eat-enemy", () => {
    globalState.score += 50;
  });

  return world;
};
