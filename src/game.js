import { createWorld } from "./ecs";
import {
  SpriteComponent,
  PositionComponent,
  VelocityComponent,
  WanderComponent
} from "./components";
import { RenderSystem, MovementSystem, WanderSystem } from "./systems";
import { blob } from "./assemblages";

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  world.createEntity(blob);
  world.createEntity(blob);
  world.createEntity(blob);

  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, w, h)
  );
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem);
  world.addSystem([VelocityComponent, WanderComponent], WanderSystem);

  return world;
};
