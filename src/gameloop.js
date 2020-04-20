const gameLoop = cb => {
  let pt = 0;
  const tick = t => {
    const dt = (t - pt) / 1000;
    pt = t;
    cb(dt);
    requestAnimationFrame(tick);
  };
  tick(0);
};

export default gameLoop;
