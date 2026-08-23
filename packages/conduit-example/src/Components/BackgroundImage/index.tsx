import type { ComponentProps, ElementType } from "react";

import "./styles.scss";

export const BackgroundImage = <T extends ElementType>({
  Tag,
  children,
  ...rest
}: Props<T>) => {
  return (
    <Tag className="background-image thunder" {...rest}>
      <div>{children}</div>
    </Tag>
  );
};

type Props<T extends ElementType> = ComponentProps<T> & {
  Tag: T;
};
