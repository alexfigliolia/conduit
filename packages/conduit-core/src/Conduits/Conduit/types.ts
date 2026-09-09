import type {
  ConduitCacheIndex,
  ConduitValue,
  IOperation,
} from "../BaseConduit";
import type { ConduitStatus } from "../../Cache";

export type ConduitChangeEvent<O extends IOperation, D = undefined> = (value: {
  value: ConduitValue<O, D>;
  status: ConduitStatus;
}) => void;

export interface ConduitOperationSubscriber<
  O extends IOperation,
  D = undefined,
> extends ConduitCacheIndex<O> {
  onChange: ConduitChangeEvent<O, D>;
}
