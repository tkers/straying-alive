import {
  PositionComponent,
  SpriteComponent,
  SpriteFadeComponent,
  MembraneComponent,
  VelocityComponent,
  WanderComponent,
  ControllableComponent,
  DecayComponent,
  DelayedSpawnComponent,
  BucketSpawnComponent,
  HungrySpawnComponent
} from "./components";
import { rnd, choose, getDirection } from "./utils";

const WIDTH = 960;
const HEIGHT = 640;

const BASE_RAD = 30;
const BLOB_RAD = 20;
const BLOB_SPD = 30;
const BLOB_ACC = BLOB_SPD / 4;
const BLOB_TIM = Math.sqrt(((BASE_RAD + BLOB_RAD) / BLOB_ACC) * 2);
const ENEMY_RAD = 15;
const ENEMY_SPD = 100;
const FOOD_SPD = 5;
const FOOD_RAD = 5;
const FOOD_TIM = (ENEMY_RAD + FOOD_RAD) / (FOOD_SPD + ENEMY_SPD);

export const blob = parent => ent =>
  ent
    .addTag("blob")
    .addComponent(
      new PositionComponent(
        parent.components.PositionComponent.x,
        parent.components.PositionComponent.y
      )
    )
    .addComponent(
      new SpriteComponent(BLOB_RAD, parent.components.SpriteComponent.color)
    )
    .addComponent(new SpriteFadeComponent("#7ACCAF", 5, BLOB_TIM + rnd(0.5)))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(BLOB_SPD, rnd(360), BLOB_ACC))
    .addComponent(
      new WanderComponent({ interval: 5, intervalVar: 1, turnSpeed: 90 })
    )
    .addComponent(new ControllableComponent(250, 3600));

export const base = ent =>
  ent
    .addTag("base")
    .addComponent(new PositionComponent(WIDTH / 2, HEIGHT / 2))
    .addComponent(new SpriteComponent(BASE_RAD, "#f5e4aa"))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new HungrySpawnComponent(blob(ent), 5))
    .on("eat-food", () => {
      ent.components.HungrySpawnComponent.food++;
    });

export const food = parent => ent =>
  ent
    .addTag("food")
    .addComponent(
      new PositionComponent(
        parent.components.PositionComponent.x,
        parent.components.PositionComponent.y
      )
    )
    .addComponent(
      new SpriteComponent(FOOD_RAD, parent.components.SpriteComponent.color)
    )
    .addComponent(new SpriteFadeComponent("#7ACCAF", 5, FOOD_TIM + rnd(1)))
    .addComponent(new MembraneComponent(3, "#fff"))
    .addComponent(new VelocityComponent(FOOD_SPD, rnd(360)))
    .addComponent(new DecayComponent(5, 10))
    .addComponent(
      new WanderComponent({
        interval: 40 / FOOD_SPD + 5,
        intervalVar: 5,
        turnSpeed: 10
      })
    );

export const enemy = target => ent => {
  const position = choose([
    new PositionComponent(-20, rnd(HEIGHT)),
    new PositionComponent(WIDTH + 20, rnd(HEIGHT)),
    new PositionComponent(rnd(WIDTH), -20),
    new PositionComponent(rnd(WIDTH), HEIGHT + 20)
  ]);

  const direction =
    getDirection(
      position.x,
      position.y,
      target.components.PositionComponent.x,
      target.components.PositionComponent.y
    ) + rnd(-30, 30);

  ent
    .addTag("enemy")
    .addComponent(position)
    .addComponent(new VelocityComponent(ENEMY_SPD, direction))
    .addComponent(new SpriteComponent(ENEMY_RAD, "#DA7783"))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(
      new WanderComponent({
        interval: 1,
        intervalVar: 1,
        turnSpeed: 360,
        directionVar: 45
      })
    )
    .addComponent(new BucketSpawnComponent(food(ent), 3, 1, 4));
};

export const enemyBase = target => ent =>
  ent
    .addComponent(new BucketSpawnComponent(enemy(target), 2, 5, 12))
    .on("score-change", score => {
      ent.components.BucketSpawnComponent.capacity = Math.floor(
        2 + (8 / 1000) * score
      );
      ent.components.BucketSpawnComponent.inDelay = Math.max(
        1,
        Math.ceil(5 - (4 / 1200) * score)
      );
      ent.components.BucketSpawnComponent.outDelay = Math.max(
        2,
        Math.ceil(12 - (10 / 1500) * score)
      );
    });
