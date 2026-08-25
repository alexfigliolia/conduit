import type { ReactNode } from "react";

import type {
  IOption,
  ListBoxEventCallback,
  ListBoxItemRenderer,
} from "./Option";
import type { ListBoxProviderProps } from "./Context";

export interface EmptyStateProps {
  renderEmptyState?: () => ReactNode;
}

export type ListBoxCommonUIProps<T extends IOption> = EmptyStateProps &
  WithListBoxLabelOptions<{
    className?: string;
    onItemClick?: ListBoxEventCallback;
    renderItem?: ListBoxItemRenderer<T>;
  }>;

export type Props<T extends IOption> = ListBoxProviderProps<T> &
  ListBoxCommonUIProps<T>;

export type ListBoxBaseUIProps<T extends IOption> = ListBoxCommonUIProps<T> & {
  items: T[];
  containerID: string;
  multiple?: boolean;
};

export type ListBoxUIProps<T extends IOption> = WithListBoxLabelOptions<
  ListBoxBaseUIProps<T>
>;

export type ListBoxLabelOptions =
  | { independent?: true; label: string }
  | { independent: false; label?: never };

export type WithListBoxLabelOptions<T> = T & ListBoxLabelOptions;
