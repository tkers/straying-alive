import {
  PositionComponent,
  SpriteComponent,
  VelocityComponent,
  WanderComponent
} from "./components";
import { rnd } from "./utils";

export const blob = ent =>
  ent
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(20, "#FF00FF"))
    .addComponent(new VelocityComponent(100, rnd(360)))
    .addComponent(new WanderComponent(1, 0, 360));
