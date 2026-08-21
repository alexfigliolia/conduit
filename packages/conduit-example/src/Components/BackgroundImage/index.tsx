import type { ComponentProps, JSX } from "react";

import "./styles.scss";

export const BackgroundImage = <T extends keyof JSX.IntrinsicElements>({
  Tag,
  children,
  ...rest
}: Props<T>) => {
  return (
    // @ts-expect-error figure it out later
    <Tag className="background-image thunder" {...rest}>
      <div>{children}</div>
    </Tag>
  );
};

type Props<T extends keyof JSX.IntrinsicElements> = ComponentProps<T> & {
  Tag: T;
};
