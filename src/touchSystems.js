import { getDistance, getDirection, turnToDir } from "./utils";

const copyTouch = ({ identifier, pageX, pageY, target }) => ({
  identifier,
  pageX: pageX - target.offsetLeft,
  pageY: pageY - target.offsetTop
});

let newTouches = [];
let ongoingTouches = [];
let endedTouches = [];
const touchMap = {};

let change = false;

export const FingerSelectionSystem = canvas => {
  canvas.addEventListener(
    "touchstart",
    evt => {
      evt.preventDefault();
      const changedTouches = evt.changedTouches;
      for (let i = 0; i < changedTouches.length; i++) {
        newTouches.push(copyTouch(changedTouches[i]));
      }
      change = true;
    },
    false
  );

  canvas.addEventListener(
    "touchend",
    evt => {
      evt.preventDefault();
      const changedTouches = evt.changedTouches;
      for (let i = 0; i < changedTouches.length; i++) {
        const t = changedTouches[i];
        const x = ongoingTouches.find(o => o.identifier === t.identifier);
        if (x) {
          endedTouches.push(x);
          ongoingTouches.filter(o => o.identifier === t.identifier);
          change = true;
        }
      }
    },
    false
  );

  canvas.addEventListener(
    "touchcancel",
    evt => {
      // same as touchend for us?
      evt.preventDefault();
      const changedTouches = evt.changedTouches;
      for (let i = 0; i < changedTouches.length; i++) {
        const t = changedTouches[i];
        const x = ongoingTouches.find(o => o.identifier === t.identifier);
        if (x) {
          endedTouches.push(x);
          ongoingTouches.filter(o => o.identifier === t.identifier);
          change = true;
        }
      }
    },
    false
  );

  return ents => {
    if (!change) return;
    change = false;

    newTouches.forEach(t => {
      const ent = ents.find(ent => {
        return (
          getDistance(
            t.pageX,
            t.pageY,
            ent.components.PositionComponent.x,
            ent.components.PositionComponent.y
          ) <= ent.components.SpriteComponent.size
        );
      });
      if (ent) {
        t.entity = ent;
        touchMap[ent] = t;
        ent.components.ControllableComponent.isSelected = true;
        ent.components.ControllableComponent.finger = true;
        ongoingTouches.push(t);
      }
    });
    newTouches = [];

    endedTouches.forEach(t => {
      const ent = t.entity;
      delete touchMap[ent];
      ent.components.ControllableComponent.isSelected = false;
      ent.components.ControllableComponent.finger = false;
      ent.components.VelocityComponent.acceleration =
        ent.components.VelocityComponent.maxSpeed;
      if (ent.components.WanderComponent) {
        ent.components.WanderComponent.resetTimer();
      }
    });
    endedTouches = [];
  };
};

export const FingerTargetSystem = canvas => {
  canvas.addEventListener(
    "touchmove",
    evt => {
      evt.preventDefault();
      const changedTouches = evt.changedTouches;
      for (let i = 0; i < changedTouches.length; i++) {
        const t = changedTouches[i];
        const x = ongoingTouches.find(o => o.identifier === t.identifier);
        if (x) {
          x.pageX = t.pageX - t.target.offsetLeft;
          x.pageY = t.pageY - t.target.offsetTop;
        }
      }
    },
    false
  );
  return (ents, dt) => {
    ents
      .filter(
        ent =>
          ent.components.ControllableComponent.isSelected &&
          ent.components.ControllableComponent.finger
      )
      .forEach(ent => {
        const touch = touchMap[ent];
        if (!touch) return; // should not happen but oh well

        const dist = getDistance(
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y,
          touch.pageX,
          touch.pageY
        );

        if (dist < ent.components.VelocityComponent.speed / 2) {
          ent.components.VelocityComponent.speed = dist;
          ent.components.VelocityComponent.acceleration =
            ent.components.VelocityComponent.maxSpeed * 10;
        }

        const targetDir = getDirection(
          ent.components.PositionComponent.x,
          ent.components.PositionComponent.y,
          touch.pageX,
          touch.pageY
        );
        ent.components.VelocityComponent.direction = turnToDir(
          ent.components.VelocityComponent.direction,
          targetDir,
          ent.components.ControllableComponent.turnSpeed * dt
        );
      });
  };
};
