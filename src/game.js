import { createWorld } from "./ecs";
import {
  SpriteComponent,
  SpriteFadeComponent,
  PositionComponent,
  VelocityComponent,
  WanderComponent,
  ControllableComponent,
  SpawnComponent
} from "./components";
import {
  RenderSystem,
  SpriteFadeSystem,
  MovementSystem,
  WanderSystem,
  MouseSelectionSystem,
  MouseTargetSystem,
  NomSystem,
  SpawnSystem,
  CullingSystem
} from "./systems";
import { base, enemyBase, blob } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  world.createEntity(base);
  world.createEntity(enemyBase);

  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);

  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, w, h)
  );
  world.addSystem([SpriteComponent, SpriteFadeComponent], SpriteFadeSystem);
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem);
  world.addSystem([VelocityComponent, WanderComponent], WanderSystem);
  world.addSystem(
    [ControllableComponent, PositionComponent, SpriteComponent],
    MouseSelectionSystem(canvas)
  );
  world.addSystem(
    [ControllableComponent, PositionComponent, VelocityComponent],
    MouseTargetSystem(canvas)
  );
  world.addSystem([PositionComponent, SpriteComponent], NomSystem);
  world.addSystem([SpawnComponent], SpawnSystem(world));
  world.addSystem(
    [PositionComponent],
    CullingSystem(-50, -50, canvas.width + 50, canvas.height + 50)
  );
  return world;
};
