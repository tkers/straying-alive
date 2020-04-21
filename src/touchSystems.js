import { ControllableComponent, TargetComponent } from "./components";
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
          ) <=
          ent.components.SpriteComponent.size +
            ent.components.MembraneComponent.size +
            10
        );
      });
      if (ent) {
        t.entity = ent;
        touchMap[ent.id] = t;
        ent.components.ControllableComponent.isSelected = true;
        ent.components.ControllableComponent.finger = true;
        ent.addComponent(
          new TargetComponent(
            t.pageX,
            t.pageY,
            ent.components.ControllableComponent.speed,
            ent.components.ControllableComponent.turnSpeed
          )
        );
        ongoingTouches.push(t);
      }
    });
    newTouches = [];

    endedTouches.forEach(t => {
      const ent = t.entity;
      delete touchMap[ent.id];
      if (!ent.hasComponent(ControllableComponent)) return;

      ent.components.ControllableComponent.isSelected = false;
      ent.components.ControllableComponent.finger = false;
      ent.removeComponent(TargetComponent);
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
          ent.hasComponent(ControllableComponent) &&
          ent.components.ControllableComponent.isSelected &&
          ent.components.ControllableComponent.finger
      )
      .forEach(ent => {
        const touch = touchMap[ent.id];
        if (!touch) return; // should not happen but oh well

        ent.components.TargetComponent.x = touch.pageX;
        ent.components.TargetComponent.y = touch.pageY;
      });
  };
};
