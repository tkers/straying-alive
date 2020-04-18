import { rnd } from "./utils";

const makeTimer = delay => {
  let time = delay;
  return dt => {
    if (time < 0) {
      return true;
    } else {
      time -= dt;
      return false;
    }
  };
};

const makeInterval = (delay, variance = 0) => {
  let time = delay + rnd(-variance, variance);
  return dt => {
    if (time < 0) {
      time = delay + rnd(-variance, variance);
      return true;
    } else {
      time -= dt;
      return false;
    }
  };
};

export function PositionComponent(x, y) {
  this.x = x;
  this.y = y;
}

export function SpriteComponent(size, color) {
  this.size = size;
  this.color = color;
}

export function SpriteFadeComponent(color, speed, delay = 0) {
  this.color = color;
  this.scale = null;
  this.speed = speed;
  this.delay = makeTimer(delay);
  this.time = 0;
}

export function MembraneComponent(size, color) {
  this.size = size;
  this.color = color;
}

export function VelocityComponent(speed, direction) {
  this.originalSpeed = speed;
  this.speed = speed;
  this.direction = direction;
}

export function WanderComponent(interval, variance, turnSpeed = 180) {
  this.timer = 0;
  this.targetDirection = null;
  this.interval = interval;
  this.variance = variance;
  this.turnSpeed = turnSpeed;

  this.resetTimer = () => {
    this.timer = this.interval + rnd(-this.variance, this.variance);
    this.targetDirection = null;
  };

  this.resetTimer();
}

export function ControllableComponent(turnSpeed) {
  this.isSelected = false;
  this.turnSpeed = turnSpeed;
}

export function SpawnComponent(assemblage, interval, variance) {
  this.interval = makeInterval(interval, variance);
  this.assemblage = assemblage;
}
