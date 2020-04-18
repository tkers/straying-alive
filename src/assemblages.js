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
import { rnd } from "./utils";

export const blob = ent =>
  ent
    .addTag("blob")
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(20, "#F5E4AA"))
    .addComponent(new SpriteFadeComponent("#7ACCAF", 3, rnd(1, 2.5)))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(60, rnd(360)))
    .addComponent(new WanderComponent(5, 1, 90))
    .addComponent(new ControllableComponent(3600));

export const base = ent =>
  ent
    .addTag("base")
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(30, "#F5E4AA"))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new SpawnComponent(blob, 5, 1));

export const enemy = ent =>
  ent
    .addTag("enemy")
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(15, "#F5E4AA"))
    .addComponent(new SpriteFadeComponent("#DA7783", 3, rnd(1, 2.5)))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(90, rnd(360)))
    .addComponent(new WanderComponent(1, 1, 360));
