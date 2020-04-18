export function PositionComponent(x, y) {
  this.x = x;
  this.y = y;
}

export function SpriteComponent(size, color) {
  this.size = size;
  this.color = color;
}

export function VelocityComponent(speed, direction) {
  this.speed = speed;
  this.direction = direction;
}

export function WanderComponent(interval, variance) {
  this.timer = 0;
  this.interval = interval;
  this.variance = variance;
}
