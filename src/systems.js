import chroma from "chroma-js";
import { hasComponent, hasTag } from "./ecs";
import {
  MembraneComponent,
  SpriteFadeComponent,
  ControllableComponent,
  SpawnComponent,
  ScoreComponent
} from "./components";
import {
  rnd,
  turnToDir,
  getDistance,
  getDirection,
  wrapDir,
  combinations
} from "./utils";
import { resizeCanvas } from "./canvas";

export const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext("2d");
  resizeCanvas(canvas, w, h);
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

    ents.filter(hasComponent(ScoreComponent)).forEach(ent => {
      ctx.fillStyle = ent.components.ScoreComponent.gameover
        ? "#DD0000"
        : "#000000";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const score = ent.components.ScoreComponent.score;
      ctx.fillText(
        `Time ${Math.floor(score / 60)}:${Math.floor(score % 60)
          .toString()
          .padStart(2, "0")}`,
        8,
        8
      );
    });
  };
};

export const ScoreSystem = (ents, dt) =>
  ents.forEach(ent => {
    if (ent.hasTag("base")) {
      ent.components.ScoreComponent.score += dt;
    } else {
      ent.components.ScoreComponent.gameover = true;
    }
  });

export const MovementSystem = (ents, dt) =>
  ents.forEach(ent => {
    const r = (ent.components.VelocityComponent.direction * Math.PI) / 180;
    ent.components.PositionComponent.x +=
      Math.cos(r) * ent.components.VelocityComponent.speed * dt;
    ent.components.PositionComponent.y +=
      Math.sin(r) * ent.components.VelocityComponent.speed * dt;
    const ds =
      ent.components.VelocityComponent.originalSpeed -
      ent.components.VelocityComponent.speed;
    if (ds > 0) {
      ent.components.VelocityComponent.speed = Math.min(
        ent.components.VelocityComponent.originalSpeed,
        ent.components.VelocityComponent.speed + dt * ds
      );
    }
  });

export const WanderSystem = (ents, dt) =>
  ents
    .filter(
      ent =>
        !ent.hasComponent(ControllableComponent) ||
        !ent.components.ControllableComponent.isSelected
    )
    .forEach(ent => {
      if (ent.components.WanderComponent.originalDirection === null) {
        ent.components.WanderComponent.originalDirection =
          ent.components.VelocityComponent.direction;
      }
      if (ent.components.WanderComponent.timer > 0) {
        ent.components.WanderComponent.timer -= dt;
      } else {
        ent.components.WanderComponent.resetTimer();
        ent.components.WanderComponent.targetDirection =
          ent.components.WanderComponent.directionVariance === 360
            ? rnd(360)
            : wrapDir(
                ent.components.WanderComponent.originalDirection +
                  rnd(
                    -ent.components.WanderComponent.directionVariance,
                    ent.components.WanderComponent.directionVariance
                  )
              );
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
        const dist = getDistance(
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y,
          mouseX,
          mouseY
        );

        ent.components.VelocityComponent.speed =
          dist < ent.components.VelocityComponent.originalSpeed
            ? dist
            : ent.components.VelocityComponent.originalSpeed;

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
      if (ent.components.SpriteFadeComponent.delay(dt)) {
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

export const NomSystem = (ents, dt) => {
  const n = combinations(ents, hasTag("blob"), hasTag("enemy"));
  n.filter(
    ([blob, enemy]) =>
      getDistance(
        blob.components.PositionComponent.x,
        blob.components.PositionComponent.y,
        enemy.components.PositionComponent.x,
        enemy.components.PositionComponent.y
      ) <
      blob.components.SpriteComponent.size +
        enemy.components.SpriteComponent.size
  ).forEach(([blob, enemy]) => {
    enemy.removeTag("enemy");
    enemy.addTag("blob");
    enemy.addComponent(new SpriteFadeComponent("#7ACCAF", 100));
    enemy.addComponent(new ControllableComponent(3600));
  });
};

export const BadNomSystem = (ents, dt) => {
  const n = combinations(ents, hasTag("enemy"), hasTag("base"));
  n.filter(
    ([enemy, base]) =>
      getDistance(
        enemy.components.PositionComponent.x,
        enemy.components.PositionComponent.y,
        base.components.PositionComponent.x,
        base.components.PositionComponent.y
      ) <
      enemy.components.SpriteComponent.size +
        base.components.SpriteComponent.size
  ).forEach(([enemy, base]) => {
    enemy.addComponent(new SpriteFadeComponent("#bbbbbb", 10));
    enemy.removeTag("enemy");
    base.addComponent(new SpriteFadeComponent("#bbbbbb", 10));
    base.removeComponent(SpawnComponent);
    base.removeTag("base");
  });
};

export const SpawnSystem = world => (ents, dt) =>
  ents.forEach(ent => {
    if (ent.components.SpawnComponent.interval(dt)) {
      world.createEntity(ent.components.SpawnComponent.assemblage);
    }
  });

export const CullingSystem = (minX, minY, maxX, maxY) => ents =>
  ents.forEach(ent => {
    const { x, y } = ent.components.PositionComponent;
    if (x < minX || x > maxX || y < minY || y > maxY) {
      ent.destroy();
    }
  });
