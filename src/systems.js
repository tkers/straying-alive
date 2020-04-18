import chroma from "chroma-js";
import { hasComponent } from "./ecs";
import {
  MembraneComponent,
  SpriteFadeComponent,
  ControllableComponent
} from "./components";
import { rnd, turnToDir, getDistance, getDirection } from "./utils";

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

    ents
      .filter(
        ent =>
          ent.hasComponent(ControllableComponent) &&
          ent.components.ControllableComponent.isSelected
      )
      .forEach(ent => {
        ctx.strokeStyle = "#222";
        ctx.beginPath();
        ctx.arc(
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y,
          ent.components.SpriteComponent.size +
            (ent.components.MembraneComponent
              ? ent.components.MembraneComponent.size
              : 0) +
            5,
          0,
          Math.PI * 2
        );
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
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
  ents
    .filter(
      ent =>
        !ent.hasComponent(ControllableComponent) ||
        !ent.components.ControllableComponent.isSelected
    )
    .forEach(ent => {
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

export const MouseSelectionSystem = canvas => {
  let clickX = 0;
  let clickY = 0;
  let mode = 0;
  canvas.addEventListener("mousedown", e => {
    clickX = e.pageX - e.target.offsetLeft;
    clickY = e.pageY - e.target.offsetTop;
    mode = 1;
  });

  window.addEventListener("mouseup", e => {
    clickX = e.pageX - e.target.offsetLeft;
    clickY = e.pageY - e.target.offsetTop;
    mode = 2;
  });

  return ents => {
    if (!mode) return;

    if (mode === 1) {
      const clickedEnt = ents.find(
        ent =>
          getDistance(
            clickX,
            clickY,
            ent.components.PositionComponent.x,
            ent.components.PositionComponent.y
          ) <= ent.components.SpriteComponent.size
      );

      if (clickedEnt)
        clickedEnt.components.ControllableComponent.isSelected = true;
    }

    if (mode === 2) {
      ents.forEach(ent => {
        ent.components.ControllableComponent.isSelected = false;
        if (ent.components.WanderComponent) {
          ent.components.WanderComponent.resetTimer();
        }
      });
    }

    mode = 0;
  };
};

export const MouseTargetSystem = canvas => {
  let mouseX = 0;
  let mouseY = 0;
  canvas.addEventListener("mousemove", e => {
    mouseX = e.pageX - e.target.offsetLeft;
    mouseY = e.pageY - e.target.offsetTop;
  });

  return (ents, dt) =>
    ents
      .filter(ent => ent.components.ControllableComponent.isSelected)
      .forEach(ent => {
        const targetDir = getDirection(
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y,
          mouseX,
          mouseY
        );
        ent.components.VelocityComponent.direction = turnToDir(
          ent.components.VelocityComponent.direction,
          targetDir,
          ent.components.ControllableComponent.turnSpeed * dt
        );
      });
};

export const SpriteFadeSystem = (ents, dt) =>
  ents.forEach(ent => {
    if (!ent.components.SpriteFadeComponent.scale) {
      ent.components.SpriteFadeComponent.delay -= dt;
      if (ent.components.SpriteFadeComponent.delay < 0) {
        ent.components.SpriteFadeComponent.scale = chroma.scale([
          ent.components.SpriteComponent.color,
          ent.components.SpriteFadeComponent.color
        ]);
      }
    } else {
      ent.components.SpriteFadeComponent.time +=
        dt * ent.components.SpriteFadeComponent.speed;
      ent.components.SpriteComponent.color = ent.components.SpriteFadeComponent.scale(
        Math.min(ent.components.SpriteFadeComponent.time, 1)
      ).hex();
      if (ent.components.SpriteFadeComponent.time >= 1) {
        ent.removeComponent(SpriteFadeComponent);
      }
    }
  });
