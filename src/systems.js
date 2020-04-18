import { hasComponent } from "./ecs";
import { MembraneComponent } from "./components";
import { rnd, turnToDir } from "./utils";

export const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;

  return ents => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ents.filter(hasComponent(MembraneComponent)).forEach(ent => {
      ctx.fillStyle = ent.components.MembraneComponent.color;
      ctx.beginPath();
      ctx.arc(
        ent.components.PositionComponent.x,
        ent.components.PositionComponent.y,
        ent.components.SpriteComponent.size +
          ent.components.MembraneComponent.size,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    ents.forEach(ent => {
      ctx.fillStyle = ent.components.SpriteComponent.color;
      ctx.beginPath();
      ctx.arc(
        ent.components.PositionComponent.x,
        ent.components.PositionComponent.y,
        ent.components.SpriteComponent.size,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  };
};

export const MovementSystem = (ents, dt) =>
  ents.forEach(ent => {
    const r = (ent.components.VelocityComponent.direction * Math.PI) / 180;
    ent.components.PositionComponent.x +=
      Math.cos(r) * ent.components.VelocityComponent.speed * dt;
    ent.components.PositionComponent.y +=
      Math.sin(r) * ent.components.VelocityComponent.speed * dt;
  });

export const WanderSystem = (ents, dt) =>
  ents.forEach(ent => {
    if (ent.components.WanderComponent.timer > 0) {
      ent.components.WanderComponent.timer -= dt;
    } else {
      ent.components.WanderComponent.resetTimer();
      ent.components.WanderComponent.targetDirection = rnd(360);
    }
    if (ent.components.WanderComponent.targetDirection !== null) {
      ent.components.VelocityComponent.direction = turnToDir(
        ent.components.VelocityComponent.direction,
        ent.components.WanderComponent.targetDirection,
        ent.components.WanderComponent.turnSpeed * dt
      );
    }
  });
