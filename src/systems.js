import chroma from "chroma-js";
import { hasComponent, hasTag } from "./ecs";
import {
  TargetComponent,
  WanderComponent,
  MembraneComponent,
  SpriteFadeComponent,
  DecayComponent,
  ControllableComponent,
  DelayedSpawnComponent,
  BucketSpawnComponent,
  HungrySpawnComponent
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

export const RenderSystem = (canvas, w, h, globalState = {}) => {
  const ctx = canvas.getContext("2d");
  resizeCanvas(canvas, w, h);
  let t = 0;

  return (ents, dt) => {
    ctx.globalAlpha = 1;
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
        ctx.lineWidth = 3;
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

    // spawn timer
    ents.filter(hasComponent(DelayedSpawnComponent)).forEach(ent => {
      const remaining = Math.min(
        Math.max(
          ent.components.DelayedSpawnComponent.left /
            ent.components.DelayedSpawnComponent.delay,
          0
        ),
        1
      );

      const segs = 25;
      const circleSize =
        5 +
        ent.components.SpriteComponent.size +
        ent.components.MembraneComponent.size;
      const dotSize = 2;
      const fill = Math.ceil(remaining * segs);

      for (let i = 0; i < fill; i++) {
        const r = (i / segs) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(r) * circleSize + ent.components.PositionComponent.x;
        const y = Math.sin(r) * circleSize + ent.components.PositionComponent.y;

        ctx.fillStyle = "#FFF";
        ctx.globalAlpha = i === fill - 1 ? 1 - fill + remaining * segs : 1;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
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
    // @TODO split off in sepatate system
    if (typeof globalState.score === "number") {
      const text = `${globalState.score.toString().padStart(5, "0")}`;
      const x = w - 16;
      const y = h - 10;
      ctx.font = `30px Nanum Pen Script`;

      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      ctx.strokeStyle = "#C2B8C3";
      ctx.lineWidth = 2;
      ctx.strokeText(text, x, y + 1);
      ctx.strokeStyle = "#FFFFFF";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = "#7ACCAF";
      ctx.fillText(text, x, y);
    }
  };
};

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

export const FoodNomSystem = world => (ents, dt) => {
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
    world.emit("eat-food");
  });
};

export const NomSystem = world => (ents, dt) => {
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

    world.emit("eat-enemy");

    enemy.removeTag("enemy");
    enemy.removeComponent(BucketSpawnComponent);
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

export const BadNomSystem = world => (ents, dt) => {
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
    base.removeTag("base");
    world.emit("game-over");
  });
};

export const DelayedSpawnSystem = world => (ents, dt) =>
  ents.forEach(ent => {
    if (ent.components.DelayedSpawnComponent.tick(dt)) {
      world.createEntity(ent.components.DelayedSpawnComponent.assemblage);
      ent.removeComponent(DelayedSpawnComponent);
    }
  });

export const BucketSpawnSystem = world => (ents, dt) =>
  ents.forEach(ent => {
    if (ent.components.BucketSpawnComponent.bucket(dt)) {
      world.createEntity(ent.components.BucketSpawnComponent.assemblage);
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

export const WrappingSystem = (minX, minY, maxX, maxY) => ents =>
  ents.forEach(ent => {
    const { x, y } = ent.components.PositionComponent;
    if (ent.components.PositionComponent.x < minX) {
      ent.components.PositionComponent.x = maxX;
    }
    if (ent.components.PositionComponent.y < minY) {
      ent.components.PositionComponent.y = maxY;
    }
    if (ent.components.PositionComponent.x > maxX) {
      ent.components.PositionComponent.x = minX;
    }
    if (ent.components.PositionComponent.y > maxY) {
      ent.components.PositionComponent.y = minY;
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

const drawText = (ctx, str, x, y, size = 60, lineWidth = 3, color = "#000") => {
  ctx.font = `${size}px Nanum Pen Script`;
  ctx.strokeStyle = "#C2B8C3";
  ctx.lineWidth = lineWidth;
  ctx.strokeText(str, x, y + 1);
  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
};

export const GameOverScreenSystem = (canvas, w, h, globalState) => {
  const ctx = canvas.getContext("2d");
  let time = 0;
  return dt => {
    if (globalState.alive) return;

    time += dt * 0.5;
    time = Math.min(time, 1);

    ctx.globalAlpha = 0.9 * time;
    ctx.fillStyle = "#f6e5f5";
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = Math.min(Math.max(5 * (time - 0.5), 0), 1);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawText(
      ctx,
      "Game Over",
      w / 2,
      h / 2 -
        (globalState.score > globalState.highScore ? 50 : 30) -
        10 * (1 - ctx.globalAlpha),
      60,
      3,
      "#DA7783"
    );
    globalState.score > globalState.highScore &&
      drawText(
        ctx,
        "NEW HIGH SCORE!",
        w / 2,
        h / 2 - 25 - 10 * (1 - ctx.globalAlpha),
        20,
        3,
        "#000"
      );

    drawText(
      ctx,
      `${globalState.score.toString().padStart(5, "0")} points`,
      w / 2,
      h / 2 + 25 + 10 * (1 - ctx.globalAlpha),
      30,
      3
    );
    globalState.highScore &&
      drawText(
        ctx,
        `(high score: ${globalState.highScore
          .toString()
          .padStart(5, "0")} points)`,
        w / 2,
        h / 2 + 50 + 10 * (1 - ctx.globalAlpha),
        20,
        3
      );
  };
};

export const PauseSystem = (world, canvas, w, h) => {
  const ctx = canvas.getContext("2d");
  let isPaused = false;
  let fade = 0;

  window.addEventListener("keydown", e => {
    if (e.key === "p") {
      isPaused = !isPaused;
      if (isPaused) {
        world.getSystems("pausable").forEach(s => s.pause());
      } else {
        world.getSystems("pausable").forEach(s => s.resume());
      }
    }
  });
  return dt => {
    if (!isPaused && fade <= 0) return;

    fade += 10 * dt * (isPaused ? 1 : -1);
    fade = Math.min(Math.max(fade, 0), 1);

    ctx.globalAlpha = fade * 0.8;
    ctx.fillStyle = "#f6e5f5";
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = fade;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    drawText(ctx, "paused", w / 2, h / 2 - 15 + 5 * fade, 60, 3, "#000");
    drawText(ctx, "TAKE A BREAK!", w / 2, h / 2 + 25 - 5 * fade, 20, 2, "#000");
  };
};

export const TitleScreenSystem = (world, canvas, w, h) => {
  const ctx = canvas.getContext("2d");
  let fade = 10;
  let started = false;
  return dt => {
    if (fade <= 0) {
      if (!started) {
        started = true;
        world.emit("begin");
      }
      return;
    }

    fade -= dt * 3;

    ctx.globalAlpha = Math.min(Math.max(fade, 0), 1);
    ctx.fillStyle = "#f6e5f5";
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha =
      fade <= 1
        ? Math.min(Math.max(fade, 0), 1)
        : fade <= 8
        ? Math.min(Math.max((8 - fade) / 2, 0), 1)
        : 0;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const offs = fade <= 0.9 ? (0.9 - fade) * 8 : 0;

    drawText(ctx, "Straying Alive", w / 2, h / 2 - 25 - offs, 60, 3, "#7ACCAF");
    drawText(ctx, "GET READY!", w / 2, h / 2 + 20 + offs, 20, 2, "#000");
  };
};

export const SecondChanceSystem = (target, assemblage) => {
  let respawnDelay = 3;
  return ents => {
    if (ents.length === 0 && !target.hasComponent(DelayedSpawnComponent)) {
      target.addComponent(new DelayedSpawnComponent(assemblage, respawnDelay));
      respawnDelay *= 1.4;
    }
  };
};
