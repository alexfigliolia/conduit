import type { ComponentProps, ElementType } from "react";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const AriaHidden = <T extends ElementType>({
  Tag,
  className,
  children,
  ...props
}: Props<T>) => {
  const classes = useClassNames("aria-hidden", className);
  return (
    <Tag {...props} className={classes} aria-hidden={true}>
      {children}
    </Tag>
  );
};

type Props<T extends ElementType> = ComponentProps<T> & {
  Tag: T;
};
