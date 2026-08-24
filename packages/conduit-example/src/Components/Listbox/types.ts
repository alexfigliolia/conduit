import type { ReactNode } from "react";

import type {
  IOption,
  ListBoxEventCallback,
  ListBoxItemRenderer,
} from "./Option";
import type { ListBoxProviderProps } from "./Context";

export interface ListBoxCommonUIProps<T extends IOption> {
  className?: string;
  focusable?: boolean;
  onItemClick?: ListBoxEventCallback;
  renderItem?: ListBoxItemRenderer<T>;
  renderEmptyState?: () => ReactNode;
}

export interface Props<T extends IOption>
  extends ListBoxProviderProps<T>, ListBoxCommonUIProps<T> {}

export interface ListBoxUIProps<
  T extends IOption,
> extends ListBoxCommonUIProps<T> {
  items: T[];
  containerID: string;
  focusable?: boolean;
  multiple?: boolean;
}
