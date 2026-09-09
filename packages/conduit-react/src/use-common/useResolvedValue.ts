import { useMemo, useRef } from "react";
import { ConduitStatus } from "@figliolia/conduit";
/* oxlint-disable react/refs */

export const useResolvedValue = <T>(
  value: T,
  status: ConduitStatus,
  skip: boolean,
) => {
  const previousValue = useRef(value);

  if (status === ConduitStatus.IDOL) {
    previousValue.current = value;
  }

  return useMemo(() => {
    if (status !== ConduitStatus.IDOL || skip) {
      return previousValue.current;
    }
    return value;
  }, [value, status, skip]);
};
