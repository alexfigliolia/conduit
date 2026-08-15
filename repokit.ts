import { RepoKitConfig } from "@repokit/core";

export const RepoKit = new RepoKitConfig({
  project: "Conduit",
  commands: {
    lint: {
      command:
        "pnpm oxlint --type-aware --report-unused-disable-directives --fix && pnpm oxfmt",
      description: "Lints and formwats typescript",
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
