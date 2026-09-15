import { RepoKitCommand } from "@repokit/core";

export const Commands = new RepoKitCommand({
  name: "packages",
  description: "Package management tools for conduit",
  commands: {
    install: {
      command: "pnpm i",
      description: "Installs packages to the workspace",
      args: {
        "(--development | -D)": "Specifies the dependency as a devDependency",
      },
    },
    publish: {
      command: "pnpm tsx src/commands/release/run.ts",
      description: "Bumps package versions and runs publish workflow",
      args: {
        "(--type | -t)":
          "The type of release. Valid options are major, minor, and patch",
      },
    },
  },
});
