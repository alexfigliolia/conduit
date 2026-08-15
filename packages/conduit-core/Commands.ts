import { RepoKitCommand } from "@repokit/core";

export const Commands = new RepoKitCommand({
  name: "core",
  description: "Conduit's internal library",
  commands: {
    "run-benchmarks": {
      command: "pnpx tsx src/__benchmarks__/storage.ts",
      description: "Run graph storage benchmarks against flat hash tables",
    },
    build: {
      command: "npx tsdown",
      description: "Build the typescript library for production",
    },
    visualize: {
      command: "pnpx tsx src/__examples__/storage.ts",
      description:
        "Prints an example of the graph storage structure to the console",
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
