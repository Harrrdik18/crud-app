import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["test/**/*.integration.test.ts"],
      globalSetup: ["./test/global-setup.ts"],
      fileParallelism: false,
      hookTimeout: 30_000,
      testTimeout: 30_000,
    },
  }),
);