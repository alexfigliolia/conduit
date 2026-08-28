import { resolve } from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({})],
  appType: "spa",
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        importers: [
          {
            findFileUrl(url) {
              // Check if the Sass file is attempting to use your alias
              if (url.startsWith("Styles/Variables")) {
                // Convert the alias to an absolute file:// URL path
                return new URL(`file://${resolve("./src/Styles/Variables")}`);
              }
              return null;
            },
          },
        ],
      },
    },
  },
});
