import { State } from "@figliolia/galena";

import { LIST_BOX_OPTION_CLASS, type IOption } from "../Option";

import type { ListBoxSelectionOptions, ListBoxSelectionState } from "./types";

export class ListBoxSelection<
  T extends IOption,
> extends State<ListBoxSelectionState> {
  public static readonly ACTIVATION_KEYS = [
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  public static readonly INTERACTION_KEYS = [
    ...this.ACTIVATION_KEYS,
    "Enter",
    " ",
  ];
  protected lastKnownNodeLength = 0;
  constructor(public options: ListBoxSelectionOptions<T>) {
    super({
      isActive: false,
      currentIndex: -1,
      focusedItems: new Set(),
      selectedItems: new Set(),
      activeDescendant: undefined,
    });
  }

  public configure(options: ListBoxSelectionOptions<T>) {
    this.options = options;
  }

  public getChildNodes() {
    const nodes = document.querySelectorAll(
      `#${this.options.containerID} .${LIST_BOX_OPTION_CLASS}`,
    );
    this.lastKnownNodeLength = nodes.length;
    return nodes;
  }

  public destroy(multiple: boolean = false) {
    this.reset();
    this.options.multiple = multiple;
  }

  public pushKey(key: string) {
    const { isActive } = this.getState();
    if (!isActive && ListBoxSelection.ACTIVATION_KEYS.includes(key)) {
      this.setActive(true);
    } else if (isActive && !ListBoxSelection.INTERACTION_KEYS.includes(key)) {
      this.setActive(false);
    }
  }

  public get currentIndex() {
    return this.getState().currentIndex;
  }

  public enableInitiallySelectedOptions(initialSelected: number[]) {
    const itemList: T[] = [];
    if (!initialSelected.length) {
      return itemList;
    }
    const nodes = this.getChildNodes();
    for (const index of initialSelected) {
      this.withNodeRangeError(index, () => {
        const itemID = nodes?.[index]?.getAttribute?.("id");
        if (itemID) {
          this.selectItem(itemID);
          this.setIndex(index);
          itemList.push(this.options.items[index]);
        }
      });
    }
    return itemList;
  }

  public emitSelectedOptions() {
    const { selectedItems } = this.getState();
    const itemList: T[] = [];
    if (!selectedItems.size) {
      return itemList;
    }
    for (const ID of selectedItems) {
      const node = document.getElementById(ID);
      const index = node?.getAttribute?.("aria-posinset");
      // @ts-expect-error isNaN with string
      if (typeof index === "string" && !isNaN(index)) {
        const idx = parseInt(index);
        this.withOptionRangeError(idx, () => {
          itemList.push(this.options.items[idx]);
        });
      }
    }
    return itemList;
  }

  public setIndex(currentIndex: number) {
    this.withNodeRangeError(currentIndex, () => {
      this.mergeState({ currentIndex });
    });
  }

  public incrementCurrentIndex(nodeLength: number) {
    this.mergeState(prev => ({
      currentIndex:
        prev.currentIndex + 1 >= nodeLength ? 0 : prev.currentIndex + 1,
    }));
  }

  public decrementCurrentIndex(nodeLength: number) {
    this.mergeState(prev => ({
      currentIndex:
        prev.currentIndex - 1 < 0 ? nodeLength - 1 : prev.currentIndex - 1,
    }));
  }

  public resetFocus() {
    this.mergeState({
      currentIndex: -1,
      focusedItems: new Set(),
      activeDescendant: undefined,
    });
  }

  public activateDescendant(id: string) {
    this.mergeState({ activeDescendant: id });
  }

  public focusItem(id: string, allowMulti = true) {
    this.activateDescendant(id);
    this.mergeState(previous => {
      if (!this.options.multiple || !allowMulti) {
        return { focusedItems: new Set([id]) };
      }
      return {
        focusedItems: this.operateOnSet(previous.focusedItems, set => {
          set.add(id);
        }),
      };
    });
  }

  public selectItem(id: string) {
    this.activateDescendant(id);
    this.mergeState(previous => {
      if (previous.selectedItems.has(id)) {
        return {
          selectedItems: this.operateOnSet(previous.selectedItems, set => {
            set.delete(id);
          }),
        };
      }
      if (!this.options.multiple) {
        return { selectedItems: new Set([id]) };
      }
      return {
        selectedItems: this.operateOnSet(previous.selectedItems, set => {
          set.add(id);
        }),
      };
    });
  }

  public forceSelect(id: string) {
    this.activateDescendant(id);
    this.mergeState(previous => {
      if (!this.options.multiple) {
        return { selectedItems: new Set([id]) };
      }
      return {
        selectedItems: this.operateOnSet(previous.selectedItems, set => {
          set.add(id);
        }),
      };
    });
    this.focusItem(id);
  }

  public deselectItem(id: string) {
    this.activateDescendant(id);
    this.mergeState(previous => {
      if (!this.options.multiple) {
        return { selectedItems: new Set() };
      }
      return {
        selectedItems: this.operateOnSet(previous.selectedItems, set =>
          set.delete(id),
        ),
      };
    });
  }

  public setSelections(list: string[]) {
    this.mergeState({ selectedItems: new Set(list) });
  }

  public clearSelections() {
    this.mergeState({ selectedItems: new Set() });
  }

  public clearFocusedItems() {
    this.mergeState({ focusedItems: new Set() });
  }

  public onItemClick(id: string, index: number) {
    this.selectItem(id);
    this.setIndex(index);
    this.setActive(true);
  }

  public readonly onItemHover = (id: string, index: number) => {
    this.focusItem(id, false);
    this.setIndex(index);
  };

  public setActive(isActive: boolean) {
    this.mergeState({ isActive });
  }

  protected mergeState(
    state:
      | Partial<ListBoxSelectionState>
      | ((prev: ListBoxSelectionState) => Partial<ListBoxSelectionState>),
  ) {
    if (typeof state === "function") {
      return this.update(prev => ({ ...prev, ...state(prev) }));
    }
    this.update(prev => ({ ...prev, ...state }));
  }

  protected operateOnSet<T>(instance: Set<T>, mutator: (set: Set<T>) => void) {
    const clone = new Set(instance);
    mutator(clone);
    return clone;
  }

  protected withNodeRangeError<U>(index: number, fn: () => U) {
    return this.withRangeError(index, this.lastKnownNodeLength, "Node", fn);
  }

  protected withOptionRangeError<U>(index: number, fn: () => U) {
    return this.withRangeError(index, this.options.items.length, "Option", fn);
  }

  private withRangeError<U>(
    index: number,
    maxLength: number,
    type: "Node" | "Option",
    fn: () => U,
  ) {
    if (index < maxLength && index >= 0) {
      return fn();
    }
    const typeName = type.toLowerCase();
    console.warn(
      `${type} Range Error: Attempted to operate on list box ${typeName} index "${index}" with ${maxLength === 0 ? `no ${typeName}s` : `a ${type.toLowerCase()} boundary of "0 through ${maxLength - 1}"`}`,
    );
  }
}
