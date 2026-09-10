import { RepoKitCommand } from "@repokit/core";

export const Commands = new RepoKitCommand({
  name: "repokit-templates",
  description: "React bindings for Conduit",
  commands: {
    install: {
      command: "pnpm i",
      description: "Installs packages to the workspace",
      args: {
        "(--development | -D)": "Specifies the dependency as a devDependency",
      },
    },
  },
});
