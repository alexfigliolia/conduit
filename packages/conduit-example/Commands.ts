import { RepoKitCommand } from "@repokit/core";

export const Commands = new RepoKitCommand({
  name: "example",
  description: "An example application using Conduit",
  commands: {
    build: {
      command: "vp build",
      description: "Build's the example app for production",
    },
    dev: {
      command: "vp dev",
      description: "Runs the example app's development server",
    },
    "vite:install": {
      command: "vp install",
      description: "Installs vite plus related dependencies",
    },
    install: {
      command: "pnpm i",
      description: "Installs packages to the workspace",
      args: {
        "(--development | -D)": "Specifies the dependency as a devDependency",
      },
    },
  },
});
