import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const suppressReactUnused = (): Plugin => ({
  name: "suppress-react-unused",
  buildStart() {
    const originalWarn = this.warn;
    this.warn = (warning, ...args) => {
      const warningObj =
        typeof warning === "string" ? { message: warning } : (warning as any);
      const message = warningObj?.message ?? "";
      if (
        message.includes('external module "react"') &&
        message.includes("never used")
      ) {
        return;
      }
      originalWarn.call(this, warning as any, ...args);
    };
  },
});

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), suppressReactUnused()],
  build: {
    rollupOptions: {
      onwarn(warning, handler) {
        const isReactUnused =
          warning.code === "UNUSED_EXTERNAL_IMPORT" &&
          "source" in warning &&
          (warning as any).source === "react" &&
          "names" in warning &&
          Array.isArray((warning as any).names) &&
          (warning as any).names.includes("default");

        if (isReactUnused) {
          return;
        }
        handler(warning);
      },
    },
  },
});
