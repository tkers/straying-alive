import { createWorld } from "./ecs";
import { SpriteComponent, PositionComponent } from "./components";
import { RenderSystem } from "./systems";

export const createGame = (canvas, w = 960, h = 640) => {
  const world = createWorld();

  world
    .createEntity()
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(42, "#FF00FF"));

  world.addSystem(
    [SpriteComponent, PositionComponent],
    RenderSystem(canvas, w, h)
  );

  return world;
};
