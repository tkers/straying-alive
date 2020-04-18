import { createWorld } from "./ecs";
import {
  SpriteComponent,
  PositionComponent,
  VelocityComponent,
  WanderComponent
} from "./components";
import { RenderSystem, MovementSystem, WanderSystem } from "./systems";

const rnd = n => Math.floor(Math.random() * n);

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  world
    .createEntity()
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(42, "#FF00FF"))
    .addComponent(new VelocityComponent(100, rnd(360)))
    .addComponent(new WanderComponent(1, 0));

  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, w, h)
  );
  world.addSystem([PositionComponent, VelocityComponent], MovementSystem);
  world.addSystem([VelocityComponent, WanderComponent], WanderSystem);

  return world;
};
