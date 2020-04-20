import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: {
    file: "dist/game.js",
    format: "umd",
    name: "Game"
  },
  plugins: [commonjs(), resolve()]
};
