import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/howto.js",
  output: {
    file: "dist/howto.js",
    format: "umd",
    name: "GameHowto"
  },
  plugins: [commonjs(), resolve()]
};
