export const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext("2d");
  canvas.width = w;
  canvas.height = h;

  return ents => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ent.components.WanderComponent.timer -= dt;
    if (ent.components.WanderComponent.timer > 0) return;

    ent.components.WanderComponent.timer =
      ent.components.WanderComponent.interval -
      ent.components.WanderComponent.variance +
      Math.random() * 2 * ent.components.WanderComponent.variance;

    ent.components.VelocityComponent.direction = Math.random() * 360;
  });
