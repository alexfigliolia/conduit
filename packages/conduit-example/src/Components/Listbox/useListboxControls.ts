import {
  useCallback,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useController } from "@figliolia/react-hooks";

import { useSelection, type ISelectionConfig } from "./useSelection";
import type { IOption } from "./Option";
import { KeyStack } from "./KeyStack";

export const useListboxControls = <T extends IOption>({
  onEscape,
  ...options
}: IControlConfig<T>) => {
  const shifting = useRef(false);
  const controlling = useRef(false);
  const keyStack = useController(new KeyStack());
  const {
    resetFocus,
    forceSelect,
    focusedItems,
    selectedItems,
    focusItem,
    unfocusItem,
    selectItem,
    onItemClick,
    onItemHover,
    deselectItem,
    getChildNodes,
    activeDescendant,
    setSelectedItems,
    setFocusedItems,
    currentIndex,
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
    [getChildNodes, currentIndex],
  );

  const decrementFocusIndex = useCallback(
    (nodes = getChildNodes()) => {
      if (currentIndex.current - 1 < 0) {
        currentIndex.current = nodes.length - 1;
      } else {
        currentIndex.current--;
      }
    },
    [getChildNodes, currentIndex],
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

  const forceSelectWithScroll = useCallback(
    (node: Element) => {
      forceSelect(node.getAttribute("id")!);
      node.scrollIntoView();
    },
    [forceSelect],
  );

  const onControlA = useCallback(
    (nodes: NodeListOf<Element>) => {
      if (!controlling.current || !options.multiple) {
        return;
      }
      if (selectedItems.size === options.items.length) {
        return setSelectedItems(new Set([]));
      }
      setSelectedItems(
        new Set(Array.from(nodes).map(node => node.getAttribute("id")!)),
      );
    },
    [
      selectedItems.size,
      options.items.length,
      options.multiple,
      setSelectedItems,
    ],
  );

  const onHomeOrEnd = useCallback(
    (key: "Home" | "End", nodes: NodeListOf<Element>) => {
      const focusIndex = key === "Home" ? 0 : nodes.length - 1;
      if (controlling.current && shifting.current && options.multiple) {
        const start = key === "Home" ? 0 : currentIndex.current;
        const end = key === "Home" ? currentIndex.current : nodes.length - 1;
        for (let i = start; i <= end; i++) {
          const node = nodes[i];
          forceSelect(node.getAttribute("id")!);
        }
      } else {
        currentIndex.current = focusIndex;
        focusWithScroll(nodes[currentIndex.current]);
      }
    },
    [currentIndex, focusWithScroll, options.multiple, forceSelect],
  );

  const onArrowKey = useCallback(
    (key: "ArrowDown" | "ArrowUp", nodes: NodeListOf<Element>) => {
      const indexHandler =
        key === "ArrowDown" ? incrementFocusIndex : decrementFocusIndex;
      if (!shifting.current) {
        if (controlling.current) {
          return onHomeOrEnd(key === "ArrowDown" ? "End" : "Home", nodes);
        }
        indexHandler(nodes);
        setFocusedItems(new Set());
        return focusWithScroll(nodes[currentIndex.current]);
      }
      if (options.multiple) {
        if (nodes[currentIndex.current]) {
          forceSelect(nodes[currentIndex.current].getAttribute("id")!);
        }
        indexHandler(nodes);
        return forceSelectWithScroll(nodes[currentIndex.current]);
      }
      indexHandler(nodes);
      return selectWithScroll(nodes[currentIndex.current]);
    },
    [
      onHomeOrEnd,
      incrementFocusIndex,
      decrementFocusIndex,
      selectWithScroll,
      forceSelect,
      options.multiple,
      forceSelectWithScroll,
      currentIndex,
      setFocusedItems,
      focusWithScroll,
    ],
  );

  const toggleNode = useCallback(
    (nodes: NodeListOf<Element>) => {
      const node = nodes[currentIndex.current];
      if (!node) {
        return;
      }
      const ID = node.getAttribute("id");
      if (node.getAttribute("aria-selected") === "true") {
        return deselectItem(ID!);
      }
      return selectItem(ID!);
    },
    [deselectItem, selectItem, currentIndex],
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
      keyStack.push(e.key);
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
          return onControlA(nodes);
        case "Home":
          return onHomeOrEnd("Home", nodes);
        case "End":
          return onHomeOrEnd("End", nodes);
        case "ArrowDown":
          return onArrowKey("ArrowDown", nodes);
        case "ArrowUp":
          return onArrowKey("ArrowUp", nodes);
        case "Enter":
        case " ":
          if (keyStack.isInteracting()) {
            e.preventDefault();
          }
          return toggleNode(nodes);
        case "Escape":
          return onEscape?.();
        default:
          break;
      }
    },
    [
      toggleNode,
      onHomeOrEnd,
      onArrowKey,
      onControlA,
      onEscape,
      getChildNodes,
      keyStack,
    ],
  );

  return useMemo(
    () => ({
      onKeyUp,
      onKeyDown,
      resetFocus,
      keyStack,
      focusItem,
      unfocusItem,
      selectItem,
      onItemClick,
      onItemHover,
      deselectItem,
      activeDescendant,
      isItemFocused,
      isItemSelected,
    }),
    [
      resetFocus,
      keyStack,
      onKeyUp,
      onKeyDown,
      focusItem,
      unfocusItem,
      selectItem,
      onItemHover,
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
