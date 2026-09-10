import { RepoKitTemplate } from "@repokit/core";

export const TypeScriptLibraryTemplate = new RepoKitTemplate({
  name: "typescript",
  description: "<INSERT DESCRIPTION>",
  commands: {
    build: {
      command: "pnpm tsdown",
      description: "Build the typescript library for production",
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
