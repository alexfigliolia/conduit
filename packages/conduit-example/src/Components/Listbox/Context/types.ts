import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";

import type { IOption } from "../Option";

import type { ListBoxKeyboardControls } from "./ListBoxKeyboardControls";

export type ListBoxKeyboardEvent = ReactKeyboardEvent<any> | KeyboardEvent;

export type ListBoxKeyboardEventHandler = (e: ListBoxKeyboardEvent) => void;

export interface ListBoxProviderProps<T extends IOption> {
  items: T[];
  multiple?: boolean;
  initialSelected?: number[];
  onChange?: ListBoxChangeEvent<T>;
  onEscape?: () => void;
  containerID: string;
  ref?: RefObject<ListBoxKeyboardControls<T> | null>;
}

export type ListBoxChangeEvent<T extends IOption> = (items: T[]) => void;

export interface ListBoxContextValue<T extends IOption> {
  state: ListBoxSelectionState;
  controls: ListBoxKeyboardControls<T>;
}

export interface ListBoxSelectionState {
  isActive: boolean;
  currentIndex: number;
  focusedItems: Set<string>;
  selectedItems: Set<string>;
  activeDescendant: string | undefined;
}

export interface ListBoxSelectionOptions<T extends IOption> {
  items: T[];
  multiple?: boolean;
  containerID: string;
  onEscape?: () => void;
}
