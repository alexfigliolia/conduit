import { useMemo } from "react";

import type { ISkipWhen } from "./types";

export const useSkipWhen = (skipWhen?: ISkipWhen) => {
  return useMemo(() => {
    if (!skipWhen) {
      return false;
    }
    if (typeof skipWhen === "function") {
      return skipWhen();
    }
    return skipWhen;
  }, [skipWhen]);
};
