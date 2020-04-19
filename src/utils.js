export const rnd = (n, m) =>
  typeof m === "number" ? Math.random() * (m - n) + n : Math.random() * n;

export const choose = elems => elems[Math.floor(Math.random() * elems.length)];

export const wrapDir = d => (d + 360) % 360;
export const turnToDir = (startDir, targetDir, maxSpeed) => {
  const delta = targetDir - startDir;
  const dir = delta > 180 ? -1 : 1;
  const diff = delta > 180 ? 360 - delta : delta;
  const spd = Math.min(diff, maxSpeed);
  return wrapDir(startDir + dir * spd);
};

export const getDistance = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const getDirection = (startX, startY, targetX, targetY) => {
  const dx = targetX - startX;
  const dy = targetY - startY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

export const combinations = (elems, isLeft, isRight) => {
  const left = elems.filter(isLeft);
  const right = elems.filter(isRight);
  return left.flatMap(l => right.map(r => [l, r]));
};
