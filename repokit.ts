import { RepoKitConfig } from "@repokit/core";

export const RepoKit = new RepoKitConfig({
  project: "Conduit",
  commands: {
    lint: {
      command:
        "pnpm oxlint --type-aware --report-unused-disable-directives --fix && pnpm oxfmt",
      description: "Lints and formwats typescript",
    },
    "build:libs": {
      command: "repokit core build && repokit react build",
      description: "Builds conduit libraries",
    },
    install: {
      command: "pnpm install",
      description: "Install workspace dependencies",
    },
    test: {
      command: "pnpm vitest",
      description: "Runs all tests",
      args: {
        "(--coverage)": "Run with coverage reporting",
      },
    },
  },
});
