import { createWorld } from "./ecs";
import * as C from "./components";
import * as S from "./systems";
import * as A from "./assemblages";

import { rnd, choose, getDirection } from "./utils";
import gameLoop from "./gameloop";

const WIDTH = 300;
const HEIGHT = 150;

const createHelpWorld = (id, opts = {}) => {
  const canvas = document.getElementById(id);
  const world = createWorld();
  world.addSystem(
    [C.SpriteComponent, C.PositionComponent],
    S.RenderSystem(canvas, WIDTH, HEIGHT)
  );
  world.addSystem(
    [C.SpriteComponent, C.SpriteFadeComponent],
    S.SpriteFadeSystem
  );

  world.addSystem([C.PositionComponent, C.VelocityComponent], S.MovementSystem);
  world.addSystem([C.VelocityComponent, C.WanderComponent], S.WanderSystem);
  world.addSystem(
    [C.PositionComponent, C.VelocityComponent, C.TargetComponent],
    S.TargetSystem
  );

  world.addSystem(
    [C.ControllableComponent, C.PositionComponent, C.SpriteComponent],
    S.MouseSelectionSystem(canvas)
  );
  world.addSystem(
    [C.ControllableComponent, C.TargetComponent],
    S.MouseTargetSystem(canvas)
  );

  // collisions
  world.addSystem(
    [C.PositionComponent, C.SpriteComponent],
    S.FoodNomSystem(world)
  );
  // world.addSystem([C.PositionComponent, C.SpriteComponent], S.NomSystem(world));
  // world.addSystem(
  //   [C.PositionComponent, C.SpriteComponent],
  //   S.BadNomSystem(world)
  // );

  // lifecycle
  world.addSystem(
    [C.PositionComponent],
    opts.cull
      ? S.CullingSystem(-20, -20, WIDTH + 20, HEIGHT + 20)
      : S.WrappingSystem(-20, -20, WIDTH + 20, HEIGHT + 20)
  );
  world.addSystem([C.DecayComponent], S.DecaySystem);

  // game flow
  world.addSystem([C.DelayedSpawnComponent], S.DelayedSpawnSystem(world));
  world.addSystem([C.BucketSpawnComponent], S.BucketSpawnSystem(world));
  world.addSystem([C.HungrySpawnComponent], S.HungrySpawnSystem(world));

  // world
  //   .addSystem(["blob"], SecondChanceSystem(hq, blob(hq)))
  //   .addTag("pausable");

  gameLoop(world.update);

  return world;
};

const blob = parent => ent =>
  ent
    .addTag("blob")
    .addComponent(
      new C.PositionComponent(
        parent ? parent.components.PositionComponent.x : rnd(WIDTH),
        parent ? parent.components.PositionComponent.y : rnd(HEIGHT)
      )
    )
    .addComponent(
      new C.SpriteComponent(
        20,
        parent ? parent.components.SpriteComponent.color : "#7ACCAF"
      )
    )
    .addComponent(new C.SpriteFadeComponent("#7ACCAF", 5, 4 + rnd(0.5)))
    .addComponent(new C.MembraneComponent(5, "#fff"))
    .addComponent(new C.VelocityComponent(30, rnd(360), 7.5))
    .addComponent(
      new C.WanderComponent({ interval: 5, intervalVar: 1, turnSpeed: 90 })
    )
    .addComponent(new C.ControllableComponent(250, 3600));

const base = ent =>
  ent
    .addTag("base")
    .addComponent(new C.PositionComponent(WIDTH / 2, HEIGHT / 2))
    .addComponent(new C.SpriteComponent(30, "#f5e4aa"))
    .addComponent(new C.MembraneComponent(5, "#fff"))
    .addComponent(new C.HungrySpawnComponent(blob(ent), 4))
    .on("eat-food", () => {
      ent.components.HungrySpawnComponent.food++;
    });

const food = parent => ent => {
  const position = parent
    ? new C.PositionComponent(
        parent.components.PositionComponent.x,
        parent.components.PositionComponent.y
      )
    : choose([
        new C.PositionComponent(-20, rnd(HEIGHT)),
        new C.PositionComponent(WIDTH + 20, rnd(HEIGHT)),
        new C.PositionComponent(rnd(WIDTH), -20),
        new C.PositionComponent(rnd(WIDTH), HEIGHT + 20)
      ]);

  const direction = parent
    ? rnd(360)
    : getDirection(position.x, position.y, WIDTH / 2, HEIGHT / 2) +
      rnd(-30, 30);

  return ent
    .addTag("food")
    .addComponent(position)
    .addComponent(
      new C.SpriteComponent(
        5,
        parent ? parent.components.SpriteComponent.color : "#7ACCAF"
      )
    )
    .addComponent(new C.SpriteFadeComponent("#7ACCAF", 5, rnd(0.2)))
    .addComponent(new C.MembraneComponent(3, "#fff"))
    .addComponent(new C.VelocityComponent(5, direction))
    .addComponent(new C.DecayComponent(5, parent ? 10 : 30))
    .addComponent(
      new C.WanderComponent({
        interval: 13,
        intervalVar: 5,
        turnSpeed: 10
      })
    );
};

const enemy = ent =>
  ent
    .addTag("enemy")
    .addComponent(new C.PositionComponent(rnd(WIDTH), rnd(HEIGHT)))
    .addComponent(new C.SpriteComponent(15, "#DA7783"))
    .addComponent(new C.MembraneComponent(5, "#fff"))
    .addComponent(new C.VelocityComponent(100, rnd(360)))
    .addComponent(
      new C.WanderComponent({
        interval: 1,
        intervalVar: 1,
        turnSpeed: 360,
        directionVar: 45
      })
    )
    .addComponent(new C.BucketSpawnComponent(food(ent), 3, 1, 4));

const createBlobHelp = id => {
  const world = createHelpWorld(id);
  world.createEntity(blob());
};

const createBaseHelp = id => {
  const world = createHelpWorld(id, { cull: true });
  const hq = world.createEntity(base);
  world.createEntity(blob(hq));
  world.addSystem(["blob"], S.SecondChanceSystem(hq, blob(hq)));
};

const createFoodHelp = id => {
  const world = createHelpWorld(id);
  world.createEntity(blob());
  world.createEntity(food());
  world.createEntity(food());
  world.createEntity(food());
  setInterval(() => world.createEntity(food()), 5000);
};

const createEnemyHelp = id => {
  const world = createHelpWorld(id);
  world.createEntity(enemy);
  // world.createEntity(blob);
  // world.on("eat-food", () => world.createEntity(blob));
};

window.addEventListener("load", () => {
  createBlobHelp("help-blob");
  createBaseHelp("help-base");
  createFoodHelp("help-food");
  createEnemyHelp("help-enemy");
});
