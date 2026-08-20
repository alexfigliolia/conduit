import { memo, type SVGProps } from "react";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const SearchIcon = memo(
  ({ stroke, className, ...rest }: SVGProps<SVGSVGElement>) => {
    const classes = useClassNames("search-icon", className);
    return (
      <svg className={classes} viewBox="0 0 24 24" fill="none" {...rest}>
        <path
          stroke={stroke}
          d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
);
