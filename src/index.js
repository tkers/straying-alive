window.addEventListener("load", () => {
  const canvas = document.getElementById("root");
  canvas.width = 960;
  canvas.height = 640;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(480, 320, 42, 0, Math.PI * 2);
  ctx.fillStyle = "#FF00FF";
  ctx.fill();
});
