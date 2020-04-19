import chroma from "chroma-js";
import { hasComponent, hasTag } from "./ecs";
import {
  TargetComponent,
  WanderComponent,
  MembraneComponent,
  SpriteFadeComponent,
  DecayComponent,
  ControllableComponent,
  TimedSpawnComponent,
  ScoreComponent
} from "./components";
import {
  rnd,
  turnToDir,
  getDistance,
  getDirection,
  wrapDir,
  accelerate,
  combinations
} from "./utils";
import { resizeCanvas } from "./canvas";

let t = 0;
export const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext("2d");
  resizeCanvas(canvas, w, h);
  return (ents, dt) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // selection dashes
    t = (t + (dt * Math.PI) / 3.5) % (Math.PI * 2);
    ents
      .filter(
        ent =>
          ent.hasComponent(ControllableComponent) &&
          ent.components.ControllableComponent.isSelected
      )
      .forEach(ent => {
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.arc(
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y,
          ent.components.SpriteComponent.size +
            (ent.components.MembraneComponent
              ? ent.components.MembraneComponent.size
              : 0) +
            5,
          t,
          t + Math.PI * 2
        );
        ctx.setLineDash([10, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

    // membrane circle
    ents.filter(hasComponent(MembraneComponent)).forEach(ent => {
      ctx.globalAlpha = ent.hasComponent(DecayComponent)
        ? ent.components.DecayComponent.life
        : 1;
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

    // core circle
    ents.forEach(ent => {
      ctx.globalAlpha = ent.hasComponent(DecayComponent)
        ? ent.components.DecayComponent.life
        : 1;
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

    // score
    ents.filter(hasComponent(ScoreComponent)).forEach(ent => {
      const score = ent.components.ScoreComponent.score;
      const text = `Time ${Math.floor(score / 60)}:${Math.floor(score % 60)
        .toString()
        .padStart(2, "0")}`;

      ctx.font = "16px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.strokeText(text, 8, 8);
      ctx.fillStyle = ent.components.ScoreComponent.gameover
        ? "#DD0000"
        : "#000000";
      ctx.fillText(text, 8, 8);
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
    // update position
    const r = (ent.components.VelocityComponent.direction * Math.PI) / 180;
    ent.components.PositionComponent.x +=
      Math.cos(r) * ent.components.VelocityComponent.speed * dt;
    ent.components.PositionComponent.y +=
      Math.sin(r) * ent.components.VelocityComponent.speed * dt;

    // accelerate to target speed
    if (ent.hasComponent(TargetComponent)) {
      ent.components.VelocityComponent.speed = accelerate(
        ent.components.VelocityComponent.speed,
        ent.components.TargetComponent.speed,
        1000 * dt
      );
      return;
    }

    // accelerate to base speed
    ent.components.VelocityComponent.speed = accelerate(
      ent.components.VelocityComponent.speed,
      ent.components.VelocityComponent.baseSpeed,
      ent.components.VelocityComponent.acceleration * dt,
      500 * dt
    );
  });

export const TargetSystem = (ents, dt) => {
  ents.forEach(ent => {
    const dist = getDistance(
      ent.components.PositionComponent.x,
      ent.components.PositionComponent.y,
      ent.components.TargetComponent.x,
      ent.components.TargetComponent.y
    );

    ent.components.TargetComponent.speed =
      dist > ent.components.TargetComponent.maxSpeed / 2
        ? ent.components.TargetComponent.maxSpeed
        : dist * 2;

    const targetDir = getDirection(
      ent.components.PositionComponent.x,
      ent.components.PositionComponent.y,
      ent.components.TargetComponent.x,
      ent.components.TargetComponent.y
    );
    ent.components.VelocityComponent.direction = turnToDir(
      ent.components.VelocityComponent.direction,
      targetDir,
      ent.components.TargetComponent.turnSpeed * dt
    );
  });
};

export const WanderSystem = (ents, dt) =>
  ents
    .filter(ent => !ent.hasComponent(TargetComponent))
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
          ) <=
          ent.components.SpriteComponent.size +
            ent.components.MembraneComponent.size +
            10
      );

      if (clickedEnt) {
        clickedEnt.components.ControllableComponent.isSelected = true;
        clickedEnt.components.ControllableComponent.mouse = true;
        clickedEnt.addComponent(
          new TargetComponent(
            clickX,
            clickY,
            clickedEnt.components.ControllableComponent.speed,
            clickedEnt.components.ControllableComponent.turnSpeed
          )
        );
      }
    }

    if (mode === 2) {
      ents.forEach(ent => {
        ent.components.ControllableComponent.isSelected = false;
        ent.components.ControllableComponent.mouse = false;
        ent.removeComponent(TargetComponent);
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
  window.addEventListener("mousemove", e => {
    mouseX = e.pageX - canvas.offsetLeft;
    mouseY = e.pageY - canvas.offsetTop;
  });

  return (ents, dt) =>
    ents
      .filter(
        ent =>
          ent.components.ControllableComponent.isSelected &&
          ent.components.ControllableComponent.mouse
      )
      .forEach(ent => {
        ent.components.TargetComponent.x = mouseX;
        ent.components.TargetComponent.y = mouseY;
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

export const FoodNomSystem = base => (ents, dt) => {
  const n = combinations(ents, hasTag("blob"), hasTag("food"));
  n.filter(
    ([blob, food]) =>
      getDistance(
        blob.components.PositionComponent.x,
        blob.components.PositionComponent.y,
        food.components.PositionComponent.x,
        food.components.PositionComponent.y
      ) <
      blob.components.SpriteComponent.size -
        food.components.SpriteComponent.size
  ).forEach(([blob, food]) => {
    food.destroy();
    base.components.HungrySpawnComponent.food++;
  });
};

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
    const midX =
      (blob.components.PositionComponent.x +
        enemy.components.PositionComponent.x) /
      2;
    const midY =
      (blob.components.PositionComponent.y +
        enemy.components.PositionComponent.y) /
      2;

    enemy.removeTag("enemy");
    enemy.removeComponent(TimedSpawnComponent);
    enemy.removeComponent(WanderComponent);
    enemy.addComponent(new TargetComponent(midX, midY, 100));
    enemy.addComponent(new SpriteFadeComponent("#f6e5f5", 5));
    enemy.addComponent(new DecayComponent(4, 0.5));

    blob.removeTag("blob");
    blob.removeComponent(ControllableComponent);
    blob.removeComponent(WanderComponent);
    blob.addComponent(new TargetComponent(midX, midY, 100));
    blob.addComponent(new SpriteFadeComponent("#f6e5f5", 5));
    blob.addComponent(new DecayComponent(4, 0.5));
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
    base.addComponent(
      new SpriteFadeComponent(enemy.components.SpriteComponent.color, 10)
    );
    base.removeComponent(TimedSpawnComponent);
    base.removeTag("base");
  });
};

export const TimedSpawnSystem = world => (ents, dt) =>
  ents.forEach(ent => {
    if (ent.components.TimedSpawnComponent.interval(dt)) {
      world.createEntity(ent.components.TimedSpawnComponent.assemblage);
    }
  });

export const HungrySpawnSystem = world => (ents, dt) =>
  ents.forEach(ent => {
    if (
      ent.components.HungrySpawnComponent.food >=
      ent.components.HungrySpawnComponent.required
    ) {
      ent.components.HungrySpawnComponent.food -=
        ent.components.HungrySpawnComponent.required;
      world.createEntity(ent.components.HungrySpawnComponent.assemblage);
    }
  });

export const CullingSystem = (minX, minY, maxX, maxY) => ents =>
  ents.forEach(ent => {
    const { x, y } = ent.components.PositionComponent;
    if (x < minX || x > maxX || y < minY || y > maxY) {
      ent.destroy();
    }
  });

export const DecaySystem = (ents, dt) =>
  ents.forEach(ent => {
    if (ent.components.DecayComponent.delay > 0) {
      ent.components.DecayComponent.delay -= dt;
      return;
    }

    ent.components.DecayComponent.life -=
      ent.components.DecayComponent.speed * dt;

    if (ent.components.DecayComponent.life < 0) {
      ent.destroy();
    }
  });
