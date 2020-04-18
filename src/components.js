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
  this.delay = delay;
  this.time = 0;
}

export function MembraneComponent(size, color) {
  this.size = size;
  this.color = color;
}

export function VelocityComponent(speed, direction) {
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
    this.timer =
      this.interval - this.variance + Math.random() * 2 * this.variance;
  };

  this.resetTimer();
}

export function SelectableComponent(isSelected) {
  this.isSelected = isSelected;
}
