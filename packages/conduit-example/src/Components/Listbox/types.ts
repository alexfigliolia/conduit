import type { ReactNode } from "react";

import type {
  IOption,
  ListBoxEventCallback,
  ListBoxItemRenderer,
} from "./Option";
import type { ListBoxProviderProps, ListBoxScrollDirection } from "./Context";

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
  ListBoxCommonUIProps<T> & {
    selectable?: boolean;
    scrollDirection?: ListBoxScrollDirection;
    scrollToNodeOnFocus?: boolean;
  };

export type ListBoxBaseUIProps<T extends IOption> = ListBoxCommonUIProps<T> & {
  items: T[];
  containerID: string;
  multiple?: boolean;
};

export type ListBoxUIProps<T extends IOption> = WithListBoxLabelOptions<
  ListBoxBaseUIProps<T>
>;

export type ListBoxLabelOptions =
  | ({ independent?: true } & (
      | { "aria-labelledby": string; label: ReactNode }
      | { "aria-label": string }
    ))
  | { independent: false; label?: never; "aria-labelledby"?: string };

export type WithListBoxLabelOptions<T> = T & ListBoxLabelOptions;
