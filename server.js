const Koa = require("koa");
const static = require("koa-static");
const PORT = process.env.PORT || 3000;

const app = new Koa();

app.use(static("."));
app.listen(PORT);

console.log(`listening on port ${PORT}`);
