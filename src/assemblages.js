import {
  PositionComponent,
  SpriteComponent,
  MembraneComponent,
  VelocityComponent,
  WanderComponent,
  SelectableComponent
} from "./components";
import { rnd } from "./utils";

export const blob = ent =>
  ent
    .addComponent(new PositionComponent(480, 320))
    .addComponent(new SpriteComponent(20, "#7ACCAF"))
    .addComponent(new MembraneComponent(5, "#000"))
    .addComponent(new VelocityComponent(50, rnd(360)))
    .addComponent(new WanderComponent(5, 1, 90))
    .addComponent(new SelectableComponent());
