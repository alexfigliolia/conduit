import { memo } from "react";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const Loader = memo(({ className }: Props) => {
  const classes = useClassNames("loader-wrapper", className);
  return (
    <div className={classes}>
      <div className="box-wrap">
        <div className="box one"></div>
        <div className="box two"></div>
        <div className="box three"></div>
        <div className="box four"></div>
        <div className="box five"></div>
        <div className="box six"></div>
      </div>
    </div>
  );
});

interface Props {
  className?: string;
}
