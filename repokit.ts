import { RepoKitConfig } from "@repokit/core";
import { TypeScriptLibraryTemplate } from "@conduit/repokit-templates";

export const RepoKit = new RepoKitConfig({
  project: "Conduit",
  templates: [TypeScriptLibraryTemplate],
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
    madge: {
      command:
        "pnpm madge --circular --ts-config ./tsconfig.json --extensions ts ./",
      description: "List all circular references in the codebase using madge",
    },
    "list-circular-references": {
      command: "pnpm dpdm --no-warning --no-tree -T **/*.ts",
      description: "List all circular references in the codebase",
    },
  },
});
