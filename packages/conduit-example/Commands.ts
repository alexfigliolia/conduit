import { RepoKitCommand } from "@repokit/core";

export const Commands = new RepoKitCommand({
  name: "example",
  description: "An example application using Conduit",
  commands: {
    build: {
      command: "pnpm vite build",
      description: "Build's the example app for production",
    },
    start: {
      command: "pnpm vite",
      description: "Runs the example app's development server",
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
