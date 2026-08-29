import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useNodeDimensions, useTimeout } from "@figliolia/react-hooks";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const Column = ({ target, column, index }: IColumn) => {
  const timeout = useTimeout();
  const [animating, setAnimating] = useState(false);
  const [node, dimensions] = useNodeDimensions<HTMLDivElement>();
  const [translate, setTranslate] = useState<string | undefined>(undefined);

  const delay = useMemo(() => index * 100, [index]);

  const onNewTarget = useEffectEvent(() => {
    timeout.execute(() => {
      setTranslate(`0 -${target * 10}%`);
      setAnimating(true);
      timeout.execute(() => {
        setAnimating(false);
      }, 400);
    }, 0);
  });

  useEffect(() => {
    onNewTarget();
  }, [target]);

  const numClasses = useClassNames("nums", { animating });

  return (
    <div
      className="column"
      aria-label={column[target].toString()}
      style={{
        width: dimensions?.width,
        height: dimensions?.height,
      }}>
      <div className="dummy" ref={node} aria-hidden>
        {column[target]}
      </div>
      <div
        className={numClasses}
        style={{ translate, "--delay": `${delay}ms` }}
        aria-hidden>
        {column.map(n => (
          <div key={n} aria-hidden>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
};

export interface IColumn {
  index: number;
  target: number;
  column: (string | number)[];
}
