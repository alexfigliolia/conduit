import type { ComponentProps, ElementType } from "react";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const ScreenReaderOnly = <T extends ElementType>({
  Tag,
  className,
  children,
  ...props
}: Props<T>) => {
  const classes = useClassNames("sr-only", className);
  return (
    <Tag {...props} className={classes}>
      {children}
    </Tag>
  );
};

type Props<T extends ElementType> = ComponentProps<T> & {
  Tag: T;
};
