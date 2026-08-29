import "react";

declare module "react" {
  export interface CSSProperties {
    "--delay"?: string;
    "--end-color"?: string;
    "--start-color"?: string;
  }
}
