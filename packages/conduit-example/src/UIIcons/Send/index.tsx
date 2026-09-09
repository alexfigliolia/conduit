import { memo, type SVGProps } from "react";
import { useClassNames } from "@figliolia/classnames";

export const Send = memo(
  ({ children, className, ...rest }: SVGProps<SVGSVGElement>) => {
    const classes = useClassNames("send-icon", className);
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} {...rest}>
        <path
          d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g opacity="0.4">
          <path
            d="M10.5898 7.68018H14.8298V11.9302"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.8299 7.68018L9.16992 13.3402"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path
          opacity="0.4"
          d="M6 16.5098C9.89 17.8098 14.11 17.8098 18 16.5098"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {children}
      </svg>
    );
  },
);
