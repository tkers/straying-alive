import {
  PositionComponent,
  SpriteComponent,
  SpriteFadeComponent,
  MembraneComponent,
  VelocityComponent,
  WanderComponent,
  ControllableComponent,
  SpawnComponent
} from "./components";
import { rnd, choose, getDirection } from "./utils";

export const blob = ent =>
  ent
    .addTag("blob")
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(20, "#F5E4AA"))
    .addComponent(new SpriteFadeComponent("#7ACCAF", 3, rnd(1, 2.5)))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(60, rnd(360)))
    .addComponent(
      new WanderComponent({ interval: 5, intervalVar: 1, turnSpeed: 90 })
    )
    .addComponent(new ControllableComponent(3600));

export const base = ent =>
  ent
    .addTag("base")
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(30, "#F5E4AA"))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new SpawnComponent(blob, 5, 1));

const W = 960;
const H = 640;

export const enemy = ent => {
  const position = choose([
    new PositionComponent(-20, rnd(H)),
    new PositionComponent(W + 20, rnd(H)),
    new PositionComponent(rnd(W), -20),
    new PositionComponent(rnd(W), H + 20)
  ]);

  const direction =
    getDirection(position.x, position.y, W / 2, H / 2) + rnd(-30, 30);

  ent
    .addTag("enemy")
    .addComponent(position)
    .addComponent(new VelocityComponent(90, direction))
    .addComponent(new SpriteComponent(15, "#F5E4AA"))
    .addComponent(new SpriteFadeComponent("#DA7783", 3, rnd(0.5, 1)))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(
      new WanderComponent({
        interval: 1,
        intervalVar: 1,
        turnSpeed: 360,
        directionVar: 45
      })
    );
};

export const enemyBase = ent =>
  ent.addComponent(new SpawnComponent(enemy, 5, 1));
