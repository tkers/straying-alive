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

const makeBucket = (capacity, inRate, outRate) => {
  let tokens = capacity;
  let inDelay = inRate;
  let outDelay = rnd(outRate);
  return dt => {
    inDelay -= dt;
    if (inDelay < 0) {
      inDelay = inRate;
      if (tokens < capacity) {
        tokens++;
      }
    }
    outDelay -= dt;
    if (outDelay < 0) {
      outDelay = rnd(outRate);
      if (tokens > 0) {
        tokens--;
        return true;
      }
    }
    return false;
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

export function DecayComponent(speed = 1, delay = 0) {
  this.speed = speed;
  this.delay = delay;
  this.life = 1;
}

export function MembraneComponent(size, color) {
  this.size = size;
  this.color = color;
}

export function VelocityComponent(speed, direction, acceleration) {
  this.baseSpeed = speed;
  this.speed = acceleration ? 0 : speed;
  this.acceleration = acceleration || speed;
  this.direction = direction;
}

export function TargetComponent(x, y, maxSpeed, turnSpeed = 360) {
  this.x = x;
  this.y = y;
  this.maxSpeed = maxSpeed;
  this.speed = maxSpeed;
  this.turnSpeed = turnSpeed;
}

export function WanderComponent({
  interval,
  intervalVar,
  directionVar = 360,
  turnSpeed = 180
}) {
  this.interval = interval;
  this.variance = intervalVar;
  this.turnSpeed = turnSpeed;
  this.directionVariance = directionVar;

  this.timer = 0;
  this.targetDirection = null;
  this.originalDirection = null;

  this.resetTimer = () => {
    this.timer = this.interval + rnd(-this.variance, this.variance);
    this.targetDirection = null;
  };

  this.resetTimer();
}

export function ControllableComponent(speed, turnSpeed) {
  this.isSelected = false;
  this.speed = speed;
  this.turnSpeed = turnSpeed;
}

export function TimedSpawnComponent(assemblage, interval, variance) {
  this.interval = makeInterval(interval, variance);
  this.assemblage = assemblage;
}

export function BucketSpawnComponent(assemblage, capacity, inRate, outRate) {
  this.bucket = makeBucket(capacity, inRate, outRate);
  this.assemblage = assemblage;
}

export function HungrySpawnComponent(assemblage, required) {
  this.required = required;
  this.assemblage = assemblage;
  this.food = 0;
}

export function ScoreComponent() {
  this.score = 0;
  this.gameover = false;
}
