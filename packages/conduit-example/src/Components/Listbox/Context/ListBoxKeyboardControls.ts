import type { IOption } from "../Option";

import type { ListBoxKeyboardEvent } from "./types";
import { ListBoxSelection } from "./ListBoxSelection";

export class ListBoxKeyboardControls<
  T extends IOption,
> extends ListBoxSelection<T> {
  private shifting = false;
  private controlling = false;

  public focusWithScroll(node: Element) {
    this.focusItem(node.getAttribute("id")!);
    node.scrollIntoView();
  }

  public selectWithScroll(node: Element) {
    this.selectItem(node.getAttribute("id")!);
    node.scrollIntoView();
  }

  public forceSelectWithScroll(node: Element) {
    this.forceSelect(node.getAttribute("id")!);
    node.scrollIntoView();
  }

  public readonly onKeyUp = (e: ListBoxKeyboardEvent) => {
    if (e.key === "Shift") {
      this.shifting = false;
    } else if (e.key === "Control" || e.key === "Meta") {
      this.controlling = false;
    }
  };

  public readonly onKeyDown = (e: ListBoxKeyboardEvent) => {
    this.pushKey(e.key);
    const nodes = this.getChildNodes();
    switch (e.key) {
      case "Shift":
        this.shifting = true;
        return;
      case "Control":
      case "Meta":
        this.controlling = true;
        return;
      case "a":
        return this.onControlA(nodes);
      case "Home":
        return this.onHomeOrEnd("Home", nodes);
      case "End":
        return this.onHomeOrEnd("End", nodes);
      case "ArrowDown":
        return this.onArrowKey("ArrowDown", nodes);
      case "ArrowUp":
        return this.onArrowKey("ArrowUp", nodes);
      case "Enter":
      case " ":
        if (this.getState().isActive) {
          e.preventDefault();
        }
        return this.toggleNode(nodes);
      case "Escape":
        return this.options.onEscape?.();
      default:
        break;
    }
  };

  private onControlA(nodes: NodeListOf<Element>) {
    if (!this.controlling || !this.options.multiple) {
      return;
    }
    if (this.getState().selectedItems.size === this.options.items.length) {
      return this.clearSelections();
    }
    this.setSelections(Array.from(nodes).map(node => node.getAttribute("id")!));
  }

  private onHomeOrEnd(key: "Home" | "End", nodes: NodeListOf<Element>) {
    const focusIndex = key === "Home" ? 0 : nodes.length - 1;
    if (this.controlling && this.shifting && this.options.multiple) {
      const start = key === "Home" ? 0 : this.currentIndex;
      const end = key === "Home" ? this.currentIndex : nodes.length - 1;
      for (let i = start; i <= end; i++) {
        const node = nodes[i];
        this.forceSelect(node.getAttribute("id")!);
      }
    } else {
      this.setIndex(focusIndex);
      this.withNodeRangeError(focusIndex, () => {
        this.focusWithScroll(nodes[focusIndex]);
      });
    }
  }

  private onArrowKey(key: "ArrowDown" | "ArrowUp", nodes: NodeListOf<Element>) {
    if (this.lastKnownNodeLength === 0) {
      return this.resetFocus();
    }
    if (!this.shifting) {
      if (this.controlling) {
        return this.onHomeOrEnd(key === "ArrowDown" ? "End" : "Home", nodes);
      }
      this.moveIndex(key, nodes);
      this.clearFocusedItems();
      return this.focusWithScroll(nodes[this.currentIndex]);
    }
    if (this.options.multiple) {
      this.withNodeRangeError(this.currentIndex, () => {
        this.forceSelect(nodes[this.currentIndex].getAttribute("id")!);
      });
      this.moveIndex(key, nodes);
      return this.forceSelectWithScroll(nodes[this.currentIndex]);
    }
    this.moveIndex(key, nodes);
    return this.selectWithScroll(nodes[this.currentIndex]);
  }

  private toggleNode(nodes: NodeListOf<Element>) {
    this.withNodeRangeError(this.currentIndex, () => {
      const node = nodes[this.currentIndex];
      const ID = node.getAttribute("id");
      if (node.getAttribute("aria-selected") === "true") {
        return this.deselectItem(ID!);
      }
      return this.selectItem(ID!);
    });
  }

  private moveIndex(key: "ArrowUp" | "ArrowDown", nodes: NodeListOf<Element>) {
    if (key === "ArrowDown") {
      return this.incrementCurrentIndex(nodes.length);
    }
    this.decrementCurrentIndex(nodes.length);
  }
}
