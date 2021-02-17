import typescript from "rollup-plugin-typescript2";

/** @type {import('rollup').RollupOptions} */
const config = {
  input: "./src/index.ts",
  output: [
    {
      dir: "./dist/cjs",
      format: "commonjs",
      preserveModules: true
    },
    {
      dir: "./dist/esm",
      format: "module",
      exports: "named",
      preserveModules: true
    }
  ],
  plugins: [typescript({ tsconfig: "./tsconfig.build.json" })]
};

export default config;
