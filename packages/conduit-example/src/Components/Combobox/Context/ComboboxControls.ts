import { createRef, type ChangeEvent } from "react";
import type {
  IOption,
  ListBoxKeyboardControls,
  ListBoxKeyboardEvent,
} from "@ui/Components/Listbox";
import { State } from "@figliolia/galena";

export class ComboboxControls<T extends IOption> extends State<boolean> {
  public openOnListChange = false;
  public isInteractedWith = false;
  public readonly input = createRef<HTMLInputElement>();
  public readonly listbox = createRef<ListBoxKeyboardControls<T>>();
  constructor(public totalItems: number) {
    super(false);
  }

  public focusInput() {
    this.input?.current?.focus?.();
  }

  public configure(totalItems: number) {
    this.totalItems = totalItems;
  }

  public readonly close = () => {
    this.set(false);
  };

  public readonly onInputClick = () => {
    if (this.isInteractedWith || (this.openOnListChange && !this.totalItems)) {
      this.set(true);
      this.listbox.current?.setActive?.(false);
    }
  };

  public onSearchBoxChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    if (!this.isInteractedWith && value.length) {
      this.isInteractedWith = true;
    }
    if (!this.totalItems) {
      this.openOnListChange = true;
    }
    if ((this.isInteractedWith || this.openOnListChange) && !!this.totalItems) {
      this.set(true);
    }
    return value;
  }

  public readonly onKeyUp = (e: ListBoxKeyboardEvent) => {
    this.listbox.current?.onKeyUp?.(e);
  };

  public readonly onKeyDown = (e: ListBoxKeyboardEvent) => {
    this.listbox.current?.onKeyDown?.(e);
    if (e.key === "ArrowDown" && this.isInteractedWith) {
      this.set(true);
    }
  };
}
