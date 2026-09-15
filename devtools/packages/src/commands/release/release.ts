import { join } from "node:path";
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

import { Logger, SemverRelease } from "@figliolia/semver";
import { ChildProcess } from "@figliolia/child-process";

export class Release {
  static readonly ROOT = execSync("git rev-parse --show-toplevel")
    .toString()
    .trim();
  static readonly REPLACE_CONDUIT_SYMLINKS = ["conduit-react"];
  static readonly PUBLISHABLE_PACKAGES = ["conduit-core", "conduit-react"];
  public static release = new SemverRelease({
    onComplete: async version => {
      await this.bumpWorkspaceVersions(version);
      await this.gitCommand("git add .");
      await this.gitCommand(`git commit -m v${version}`);
      await this.replaceLocalSymlinks(version);
      await new ChildProcess("repokit build:libs").handler;
      await cp(
        join(this.ROOT, "README.md"),
        join(this.ROOT, "packages/conduit-core/README.md"),
      );
      await new ChildProcess("npm login").handler;
      // TODO - figure out why publish calls fail
      // await this.publishLibraries();
      // await this.gitCommand("git restore .");
    },
  });

  private static async forEachPackage(
    callback: (packageName: string, packageJSONPath: string) => Promise<void>,
  ) {
    await Promise.all(
      ["devtools", "packages"].map(workspace =>
        (async () => {
          const workspacePath = join(this.ROOT, workspace);
          const packages = await readdir(workspacePath, {
            withFileTypes: true,
          });
          for (const directory of packages) {
            const packageFilePath = join(
              workspacePath,
              directory.name,
              "package.json",
            );
            if (directory.isDirectory() && existsSync(packageFilePath)) {
              await callback(directory.name, packageFilePath);
            }
          }
        })(),
      ),
    );
  }

  private static async bumpWorkspaceVersions(version: string) {
    return this.forEachPackage(async (_, packageJSONPath) => {
      const packageJSON = JSON.parse(
        (await readFile(packageJSONPath)).toString(),
      );
      packageJSON.version = version;
      return writeFile(packageJSONPath, JSON.stringify(packageJSON, null, 2));
    });
  }

  private static async replaceLocalSymlinks(version: string) {
    return this.forEachPackage(async (packageName, packageJSONPath) => {
      if (!this.REPLACE_CONDUIT_SYMLINKS.includes(packageName)) {
        return;
      }
      const packageJSON = JSON.parse(
        (await readFile(packageJSONPath)).toString(),
      );
      this.replaceLinkedLocalPackages(packageJSON.dependencies, version);
      this.replaceLinkedLocalPackages(packageJSON.devDependencies, version);
      this.replaceLinkedLocalPackages(packageJSON.peerDependencies, version);
      return writeFile(packageJSONPath, JSON.stringify(packageJSON, null, 2));
    });
  }

  private static replaceLinkedLocalPackages(
    dependencies: Record<string, string>,
    version: string,
  ) {
    for (const key in dependencies) {
      if (
        key.startsWith("@figliolia/conduit") &&
        dependencies[key]?.startsWith("link:")
      ) {
        dependencies[key] = `^${version}`;
      }
    }
  }

  private static async publishLibraries() {
    return this.forEachPackage(async (packageName, packageJSONPath) => {
      if (this.PUBLISHABLE_PACKAGES.includes(packageName)) {
        Logger.info(
          `Publishing @figliolia/${packageName} from ${join(packageJSONPath, "..")}`,
        );
        await new ChildProcess("npm publish", {
          cwd: join(packageJSONPath, ".."),
        }).handler;
      }
    });
  }

  private static gitCommand(command: string) {
    return new ChildProcess(command, {
      cwd: this.ROOT,
    }).handler;
  }
}
