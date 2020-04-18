import { createWorld } from "./ecs";
import {
  SpriteComponent,
  SpriteFadeComponent,
  PositionComponent,
  VelocityComponent,
  WanderComponent,
  ControllableComponent
} from "./components";
import {
  RenderSystem,
  SpriteFadeSystem,
  MovementSystem,
  WanderSystem,
  MouseSelectionSystem,
  MouseTargetSystem,
  NomSystem
} from "./systems";
import { base, blob, enemy } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);

  world.createEntity(enemy);
  world.createEntity(enemy);
  world.createEntity(enemy);
  world.createEntity(enemy);

  world.createEntity(base);

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
  return world;
};
