import { createWorld } from "./ecs";
import {
  SpriteComponent,
  SpriteFadeComponent,
  PositionComponent,
  VelocityComponent,
  WanderComponent,
  ControllableComponent,
  SpawnComponent,
  ScoreComponent
} from "./components";
import {
  RenderSystem,
  SpriteFadeSystem,
  MovementSystem,
  WanderSystem,
  MouseSelectionSystem,
  MouseTargetSystem,
  NomSystem,
  BadNomSystem,
  SpawnSystem,
  CullingSystem,
  ScoreSystem
} from "./systems";
import { base, enemyBase, blob } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  world.createEntity(base);
  world.createEntity(enemyBase);

  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);

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
    CullingSystem(-50, -50, canvas.width + 50, canvas.height + 50)
  );

  // control
  world.addSystem(
    [ControllableComponent, PositionComponent, SpriteComponent],
    MouseSelectionSystem(canvas)
  );
  world.addSystem(
    [ControllableComponent, PositionComponent, VelocityComponent],
    MouseTargetSystem(canvas)
  );

  // collisions
  world.addSystem([PositionComponent, SpriteComponent], NomSystem);
  world.addSystem([PositionComponent, SpriteComponent], BadNomSystem);

  // game flow
  world.addSystem([SpawnComponent], SpawnSystem(world));
  world.addSystem([ScoreComponent], ScoreSystem);

  return world;
};
