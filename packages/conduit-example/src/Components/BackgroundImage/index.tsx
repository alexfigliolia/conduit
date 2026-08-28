import type { ComponentProps, ElementType } from "react";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const BackgroundImage = <T extends ElementType>({
  Tag,
  children,
  className,
  ...rest
}: Props<T>) => {
  const classes = useClassNames("background-image", "thunder", className);
  return (
    <Tag className={classes} {...rest}>
      <div>{children}</div>
    </Tag>
  );
};

type Props<T extends ElementType> = ComponentProps<T> & {
  Tag: T;
};
