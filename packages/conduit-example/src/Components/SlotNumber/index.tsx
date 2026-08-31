import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useController, useNodeDimensions } from "@figliolia/react-hooks";

import { Queue } from "./Queue";
import { Column } from "./Column";

import "./styles.scss";

export const SlotNumber = ({ value }: Props) => {
  const queue = useController(new Queue());
  const [currentValue, setCurrentValue] = useState(value);
  const [node, dimensions] = useNodeDimensions<HTMLDivElement>();

  const enqueue = useEffectEvent((value: string | number) => {
    void queue.push(() => setCurrentValue(value));
  });

  useEffect(() => {
    enqueue(value);
  }, [value]);

  const columns = useMemo(() => {
    const columns = currentValue
      .toString()
      .split("")
      .map(v => ({ column: [v], target: 0 }));
    for (const entry of columns) {
      // @ts-expect-error isNaN accepts strings
      if (!isNaN(entry.column[0]!)) {
        const value = parseInt(entry.column[0]);
        entry.target = value;
        entry.column = [
          ...Array.from({ length: value }, (_, i) => i.toString()),
          ...entry.column,
          ...Array.from({ length: 8 - value + 1 }, (_, i) =>
            (value + i + 1).toString(),
          ),
        ];
      } else {
        entry.column.unshift("");
        entry.target = 1;
      }
    }
    return columns;
  }, [currentValue]);

  return (
    <div
      className="slot-machine-numbers"
      aria-label={value.toString()}
      style={{
        width: dimensions?.width,
        height: dimensions?.height,
      }}>
      <div className="dummy" ref={node}>
        {value}
      </div>
      {columns.map((column, i) => (
        <Column key={i} index={i} {...column} />
      ))}
    </div>
  );
};

interface Props {
  value: number | string;
}
