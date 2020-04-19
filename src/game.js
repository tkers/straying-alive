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
  HungrySpawnComponent,
  ScoreComponent
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
  HungrySpawnSystem,
  CullingSystem,
  ScoreSystem
} from "./systems";
import { FingerSelectionSystem, FingerTargetSystem } from "./touchSystems";
import { base, enemyBase, blob, food } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  const hq = world.createEntity(base);
  world.createEntity(enemyBase(hq));
  setTimeout(() => {
    world.createEntity(blob(hq));
  }, 200);

  // visuals
  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, w, h)
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

  // control
  world.addSystem(
    [ControllableComponent, PositionComponent, SpriteComponent],
    MouseSelectionSystem(canvas)
  );
  world.addSystem(
    [ControllableComponent, TargetComponent],
    MouseTargetSystem(canvas)
  );

  // touch control
  world.addSystem(
    [ControllableComponent, PositionComponent, SpriteComponent],
    FingerSelectionSystem(canvas)
  );
  world.addSystem(
    [ControllableComponent, PositionComponent, VelocityComponent],
    FingerTargetSystem(canvas)
  );

  // collisions
  world.addSystem([PositionComponent, SpriteComponent], FoodNomSystem(hq));
  world.addSystem([PositionComponent, SpriteComponent], NomSystem);
  world.addSystem([PositionComponent, SpriteComponent], BadNomSystem);
  world.addSystem([DecayComponent], DecaySystem);

  // game flow
  world.addSystem([TimedSpawnComponent], TimedSpawnSystem(world));
  world.addSystem([HungrySpawnComponent], HungrySpawnSystem(world));
  world.addSystem([ScoreComponent], ScoreSystem);

  return world;
};
