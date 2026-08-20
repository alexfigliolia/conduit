import {
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { useSelection, type ISelectionConfig } from "./useSelection";
import type { IOption } from "./Option";

export const useListboxControls = <T extends IOption>({
  onEscape,
  ...options
}: IControlConfig<T>) => {
  const currentIndex = useRef(-1);
  const shifting = useRef(false);
  const controlling = useRef(false);
  const {
    focusedItems,
    selectedItems,
    focusItem,
    unfocusItem,
    selectItem,
    onItemClick,
    deselectItem,
    getChildNodes,
    activeDescendant,
    setFocusedItems,
  } = useSelection(options);

  const isItemFocused = useCallback(
    (id: string) => {
      return focusedItems.has(id);
    },
    [focusedItems],
  );

  const isItemSelected = useCallback(
    (id: string) => {
      return selectedItems.has(id);
    },
    [selectedItems],
  );

  const incrementFocusIndex = useCallback(
    (nodes = getChildNodes()) => {
      if (currentIndex.current + 1 >= nodes.length) {
        currentIndex.current = 0;
      } else {
        currentIndex.current++;
      }
    },
    [getChildNodes],
  );

  const decrementFocusIndex = useCallback(
    (nodes = getChildNodes()) => {
      if (currentIndex.current - 1 < 0) {
        currentIndex.current = nodes.length - 1;
      } else {
        currentIndex.current--;
      }
    },
    [getChildNodes],
  );

  const focusWithScroll = useCallback(
    (node: Element) => {
      focusItem(node.getAttribute("id")!);
      node.scrollIntoView();
    },
    [focusItem],
  );

  const selectWithScroll = useCallback(
    (node: Element) => {
      selectItem(node.getAttribute("id")!);
      node.scrollIntoView();
    },
    [selectItem],
  );

  const onKeyUp = useCallback((e: ReactKeyboardEvent<any> | KeyboardEvent) => {
    if (e.key === "Shift") {
      shifting.current = false;
    } else if (e.key === "Control" || e.key === "Meta") {
      controlling.current = false;
    }
  }, []);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<any> | KeyboardEvent) => {
      const nodes = getChildNodes();
      switch (e.key) {
        case "Shift":
          shifting.current = true;
          return;
        case "Control":
        case "Meta":
          controlling.current = true;
          return;
        case "a":
          if (!controlling.current) {
            return;
          }
          for (const node of nodes) {
            selectItem(node.getAttribute("id")!);
          }
          return;
        case "Home":
          if (controlling.current && shifting.current) {
            for (let i = 0; i <= currentIndex.current; i++) {
              const node = nodes[i];
              selectItem(node.getAttribute("id")!);
            }
            currentIndex.current = 0;
            focusWithScroll(nodes[0]);
            return;
          }
          currentIndex.current = 0;
          return focusWithScroll(nodes[currentIndex.current]);
        case "End":
          if (controlling.current && shifting.current) {
            for (let i = currentIndex.current; i < nodes.length; i++) {
              const node = nodes[i];
              selectItem(node.getAttribute("id")!);
            }
            focusWithScroll(nodes[nodes.length - 1]);
            currentIndex.current = nodes.length - 1;
            return;
          }
          currentIndex.current = nodes.length - 1;
          return focusWithScroll(nodes[currentIndex.current]);
        case "ArrowDown":
          incrementFocusIndex(nodes);
          if (!shifting.current) {
            setFocusedItems(new Set());
            return focusWithScroll(nodes[currentIndex.current]);
          }
          return selectWithScroll(nodes[currentIndex.current]);
        case "ArrowUp":
          decrementFocusIndex(nodes);
          if (!shifting.current) {
            setFocusedItems(new Set());
            return focusWithScroll(nodes[currentIndex.current]);
          }
          return selectWithScroll(nodes[currentIndex.current]);
        case "Enter":
          return selectItem(nodes[currentIndex.current].getAttribute("id")!);
        case " ":
          const node = nodes[currentIndex.current];
          if (!node) {
            return;
          }
          const ID = node.getAttribute("id");
          if (node.getAttribute("aria-selected") === "true") {
            return deselectItem(ID!);
          }
          return selectItem(ID!);
        case "Escape":
          return onEscape?.();
        default:
          break;
      }
    },
    [
      onEscape,
      selectItem,
      deselectItem,
      decrementFocusIndex,
      incrementFocusIndex,
      focusWithScroll,
      selectWithScroll,
      getChildNodes,
      setFocusedItems,
    ],
  );

  return useMemo(
    () => ({
      onKeyUp,
      onKeyDown,
      focusItem,
      unfocusItem,
      selectItem,
      onItemClick,
      deselectItem,
      activeDescendant,
      isItemFocused,
      isItemSelected,
    }),
    [
      onKeyUp,
      onKeyDown,
      focusItem,
      unfocusItem,
      selectItem,
      deselectItem,
      activeDescendant,
      onItemClick,
      isItemFocused,
      isItemSelected,
    ],
  );
};

export interface IControlConfig<T extends IOption> extends ISelectionConfig<T> {
  onEscape?: () => void;
}

export type ListBoxControls = ReturnType<typeof useListboxControls>;

export type ListBoxKeyboardEvent = ReactKeyboardEvent<any> | KeyboardEvent;

export type ListBoxKeyboardEventHandler = (e: ListBoxKeyboardEvent) => void;
