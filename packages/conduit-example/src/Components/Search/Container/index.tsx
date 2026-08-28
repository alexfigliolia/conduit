import type { PropsWithChildren } from "react";
import { GlassContainer } from "@ui/Components/GlassContainer";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const Container = ({
  children,
  isOpen,
}: PropsWithChildren<{ isOpen: boolean }>) => {
  const classes = useClassNames("search-dropdown", { open: isOpen });
  return (
    <GlassContainer Tag="div" className={classes}>
      {children}
    </GlassContainer>
  );
};
