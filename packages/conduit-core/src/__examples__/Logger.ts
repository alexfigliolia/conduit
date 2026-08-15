import chalk from "chalk";

export class Logger {
  private static readonly prefix = chalk.blueBright.bold("Conduit:");

  public static info(message: any) {
    console.log(this.prefix, message);
  }
}
