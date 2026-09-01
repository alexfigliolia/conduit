import type {
  ConduitCacheIndex,
  ConduitValue,
  IOperation,
  IValueType,
} from "../BaseConduit";
import type { ConduitStatus } from "../../Cache";

export type ConduitChangeEvent<
  O extends IOperation,
  D = IValueType<O>,
> = (value: { value: ConduitValue<O, D>; status: ConduitStatus }) => void;

export interface ConduitOperationSubscriber<
  O extends IOperation,
  D = IValueType<O>,
> extends ConduitCacheIndex<O> {
  onChange: ConduitChangeEvent<O, D>;
}
