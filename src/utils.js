export const rnd = (n, m) =>
  typeof m === "number" ? Math.random() * (m - n) + n : Math.random() * n;

const wrapDir = d => (d + 360) % 360;
export const turnToDir = (startDir, targetDir, maxSpeed) => {
  const targetDirDiff = startDir - targetDir;
  const turnDir = wrapDir(targetDirDiff) > 180 ? 1 : -1;
  const turnSpeed = Math.min(Math.abs(targetDirDiff), maxSpeed);
  return wrapDir(startDir + turnDir * turnSpeed);
};

export const getDistance = (x1, y1, x2, y2) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export const getDirection = (startX, startY, targetX, targetY) => {
  const dx = targetX - startX;
  const dy = targetY - startY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};
