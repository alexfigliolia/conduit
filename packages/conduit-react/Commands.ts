import { RepoKitCommand } from "@repokit/core";

export const Commands = new RepoKitCommand({
  name: "react",
  description: "React bindings for Conduit",
  commands: {
    build: {
      command: "npx tsdown",
      description: "Build the typescript library for production",
    },
    install: {
      command: "pnpm i",
      description: "Installs packages to the workspace",
      args: {
        "(--development | -D)": "Specifies the dependency as a devDependency",
      },
    },
    test: {
      command: "pnpm vitest",
      description: "Runs this package's test suites",
      args: {
        "(--coverage)": "Executes tests and generates a coverage report",
      },
    },
  },
});
