import {
  PositionComponent,
  SpriteComponent,
  SpriteFadeComponent,
  MembraneComponent,
  VelocityComponent,
  WanderComponent,
  ControllableComponent,
  SpawnComponent,
  ScoreComponent
} from "./components";
import { rnd, choose, getDirection } from "./utils";

const BASE_RAD = 30;
const BLOB_RAD = 20;
const BLOB_SPD = 60;
const BLOB_TIM = (BASE_RAD + BLOB_RAD) / BLOB_SPD;
const FOOD_SPD = 20;
const FOOD_RAD = 5;
const FOOD_TIM = (BASE_RAD + FOOD_RAD) / FOOD_SPD;

export const blob = ent =>
  ent
    .addTag("blob")
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(BLOB_RAD, "#F5E4AA"))
    .addComponent(new SpriteFadeComponent("#7ACCAF", 5, BLOB_TIM + rnd(0.5)))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(BLOB_SPD, rnd(360)))
    .addComponent(
      new WanderComponent({ interval: 5, intervalVar: 1, turnSpeed: 90 })
    )
    .addComponent(new ControllableComponent(3600));

export const food = ent =>
  ent
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(FOOD_RAD, "#F5E4AA"))
    .addComponent(new SpriteFadeComponent("#f5aadf", 5, FOOD_TIM + rnd(0.5)))
    .addComponent(new MembraneComponent(2, "#fff"))
    .addComponent(new VelocityComponent(FOOD_SPD, rnd(360)))
    .addComponent(
      new WanderComponent({
        interval: 40 / FOOD_SPD + 5,
        intervalVar: 5,
        turnSpeed: 10
      })
    );

export const base = ent =>
  ent
    .addTag("base")
    .addComponent(new ScoreComponent())
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(BASE_RAD, "#f5e4aa"))
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
    .addComponent(new SpriteComponent(15, "#DA7783"))
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
