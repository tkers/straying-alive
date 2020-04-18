import {
  PositionComponent,
  SpriteComponent,
  MembraneComponent,
  VelocityComponent,
  WanderComponent,
  SelectableComponent
} from "./components";
import { rnd } from "./utils";

export const base = ent =>
  ent
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(30, "#F5E4AA"))
    .addComponent(new MembraneComponent(5, "#fff"));

export const blob = ent =>
  ent
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(20, "#7ACCAF"))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(50, rnd(360)))
    .addComponent(new WanderComponent(5, 1, 90))
    .addComponent(new SelectableComponent());

export const enemy = ent =>
  ent
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(15, "#DA7783"))
    .addComponent(new MembraneComponent(5, "#fff"))
    .addComponent(new VelocityComponent(90, rnd(360)))
    .addComponent(new WanderComponent(1, 1, 360));
