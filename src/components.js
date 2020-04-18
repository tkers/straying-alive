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
