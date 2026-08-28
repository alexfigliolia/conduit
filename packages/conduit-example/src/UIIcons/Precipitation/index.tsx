import { memo, type SVGProps } from "react";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const Precipitation = memo(
  ({ children, className, ...rest }: SVGProps<SVGSVGElement>) => {
    const classes = useClassNames("precipitation-icon", className);
    return (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={classes}
        {...rest}>
        <path d="M11.421,3.707,3.707,11.421a1,1,0,0,1-1.414-1.414l7.714-7.714a1,1,0,0,1,1.414,1.414Zm7.715,1.157a1,1,0,0,0-1.414,0l-7.715,7.715a1,1,0,1,0,1.414,1.414l7.715-7.715A1,1,0,0,0,19.136,4.864Zm1.157,7.715-7.714,7.714a1,1,0,1,0,1.414,1.414l7.714-7.714a1,1,0,0,0-1.414-1.414Z" />
        {children}
      </svg>
    );
  },
);
