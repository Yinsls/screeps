import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";
import screeps from "rollup-plugin-screeps";
import typescript from "rollup-plugin-typescript2";

const config = require("./.secret.json")["main"];
if (!config) {
  throw new Error("未找到配置文件");
}

const pluginDeploy = config && screeps({ config, dryRun: false });
export default {
  // input: "src/main.ts", // 代码入口文件
  input: "src/record/main.js",
  output: {
    file: "build/main.js",
    format: "cjs",
    sourcemap: true,
  },
  // 清除原本build文件 | 执行上传
  plugins: [
    clear({ targets: ["build"] }),
    resolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    pluginDeploy,
  ],
};
