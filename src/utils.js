export const rnd = (n, m) =>
  typeof m === "number"
    ? Math.floor(Math.random() * (m - n)) + n
    : Math.floor(Math.random() * n);

const wrapDir = d => (d + 360) % 360;
export const turnToDir = (startDir, targetDir, maxSpeed) => {
  const targetDirDiff = startDir - targetDir;
  const turnDir = wrapDir(targetDirDiff) > 180 ? 1 : -1;
  const turnSpeed = Math.min(Math.abs(targetDirDiff), maxSpeed);
  return wrapDir(startDir + turnDir * turnSpeed);
};
