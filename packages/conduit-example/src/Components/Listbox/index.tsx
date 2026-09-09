import type { Props } from "./types";
import { type IOption } from "./Option";
import { ListboxUI } from "./ListBoxUI";
import { ListBoxProvider } from "./Context";

export const Listbox = <T extends IOption>({
  ref,
  items,
  onChange,
  onEscape,
  containerID,
  multiple = false,
  initialSelected,
  selectable,
  scrollDirection,
  scrollToNodeOnFocus,
  ...uiProps
}: Props<T>) => {
  return (
    <ListBoxProvider
      ref={ref}
      items={items}
      multiple={multiple}
      onEscape={onEscape}
      onChange={onChange}
      containerID={containerID}
      initialSelected={initialSelected}
      selectable={selectable}
      scrollDirection={scrollDirection}
      scrollToNodeOnFocus={scrollToNodeOnFocus}>
      <ListboxUI
        {...uiProps}
        items={items}
        multiple={multiple}
        containerID={containerID}
      />
    </ListBoxProvider>
  );
};

export * from "./Option";
export * from "./Context";
export * from "./types";
