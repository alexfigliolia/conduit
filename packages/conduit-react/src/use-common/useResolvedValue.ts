import { useEffect, useMemo, useRef } from "react";
import { ConduitStatus } from "@figliolia/conduit";

export const useResolvedValue = <T>(value: T, status: ConduitStatus) => {
  const previousValue = useRef(value);

  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return useMemo(() => {
    if (status !== ConduitStatus.IDOL) {
      return previousValue.current;
    }
    return value;
  }, [value, status]);
};
