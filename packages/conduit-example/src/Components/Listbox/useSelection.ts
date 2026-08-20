import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { LIST_BOX_OPTION_CLASS } from "./Option";

export const useSelection = ({
  id: containerID,
  multiple = false,
  initialSelected = [],
}: ISelectionConfig) => {
  const currentIndex = useRef(-1);
  const [focusedItems, setFocusedItems] = useState(new Set<string>());
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [activeDescendant, setActiveDescendant] = useState<string | undefined>(
    undefined,
  );

  const getChildNodes = useCallback(() => {
    return document.querySelectorAll(
      `#${containerID} .${LIST_BOX_OPTION_CLASS}`,
    );
  }, [containerID]);

  const deactivateDescendant = useCallback((id: string) => {
    setActiveDescendant(previous => {
      if (previous === id) {
        return undefined;
      }
      return id;
    });
  }, []);

  const focusItem = useCallback(
    (id: string) => {
      setActiveDescendant(id);
      setFocusedItems(previous => {
        if (!multiple) {
          return new Set([id]);
        }
        const clone = new Set(previous);
        clone.add(id);
        return clone;
      });
    },
    [multiple],
  );

  const unfocusItem = useCallback(
    (id: string) => {
      deactivateDescendant(id);
      setFocusedItems(previous => {
        if (!multiple) {
          return new Set();
        }
        const clone = new Set(previous);
        clone.delete(id);
        return clone;
      });
    },
    [deactivateDescendant, multiple],
  );

  const selectItem = useCallback(
    (id: string) => {
      setActiveDescendant(id);
      setSelectedItems(previous => {
        if (previous.has(id)) {
          const clone = new Set(previous);
          clone.delete(id);
          return clone;
        }
        if (!multiple) {
          return new Set([id]);
        }
        const clone = new Set(previous);
        clone.add(id);
        return clone;
      });
      focusItem(id);
    },
    [multiple, focusItem],
  );

  const deselectItem = useCallback(
    (id: string) => {
      deactivateDescendant(id);
      setSelectedItems(previous => {
        if (!multiple) {
          return new Set();
        }
        const clone = new Set(previous);
        clone.delete(id);
        return clone;
      });
    },
    [deactivateDescendant, multiple],
  );

  const onItemClick = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      const target = e.target as HTMLElement;
      const node =
        target.tagName === "LI" &&
        target?.classList?.contains(LIST_BOX_OPTION_CLASS)
          ? target
          : target.closest(`.${LIST_BOX_OPTION_CLASS}`)!;
      const nodeID = node.getAttribute("id")!;
      selectItem(nodeID);
      currentIndex.current = Array.from(getChildNodes()).indexOf(node);
    },
    [selectItem, getChildNodes],
  );

  useEffect(() => {
    const items = getChildNodes();
    for (const index of initialSelected) {
      const itemID = items?.[index]?.getAttribute?.("id");
      if (itemID) {
        selectItem(itemID);
        currentIndex.current = index;
      }
    }
  }, [initialSelected, selectItem, getChildNodes]);

  return useMemo(
    () => ({
      setFocusedItems,
      getChildNodes,
      focusedItems,
      selectedItems,
      activeDescendant,
      focusItem,
      onItemClick,
      unfocusItem,
      selectItem,
      deselectItem,
    }),
    [
      setFocusedItems,
      getChildNodes,
      onItemClick,
      focusedItems,
      selectedItems,
      activeDescendant,
      focusItem,
      unfocusItem,
      selectItem,
      deselectItem,
    ],
  );
};

export interface ISelectionConfig {
  id: string;
  multiple?: boolean;
  initialSelected?: number[];
}
