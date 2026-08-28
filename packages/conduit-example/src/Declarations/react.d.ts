import "react";

declare module "react" {
  export interface CSSProperties {
    "--end-color"?: string;
    "--start-color"?: string;
  }
}
