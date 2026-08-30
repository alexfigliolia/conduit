import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { useTaskQueue } from "@ui/Tools/useTaskQueue";
import { WeatherIcon, type WeatherIconProps } from "@ui/Components/WeatherIcon";

import { IconQueue } from "./Queue";

import "./styles.scss";

export const IconIndicator = ({ code, night }: WeatherIconProps) => {
  const taskQueue = useTaskQueue("sync", 500);
  const [iconQueue, setIconQueue] = useState(new IconQueue({ code, night }));

  const enqueue = useEffectEvent((next: WeatherIconProps) => {
    setIconQueue(q => q.enqueue(next));
    void taskQueue.enqueue(() => setIconQueue(q => q.dequeue()));
  });

  useEffect(() => {
    enqueue({ code, night });
  }, [code, night]);

  const className = useCallback(
    (index: number) => {
      if (iconQueue.length < 2) {
        return undefined;
      }
      if (index === 0) {
        return "prev";
      }
      if (index === 1) {
        return "next";
      }
      return "pending";
    },
    [iconQueue.length],
  );

  return (
    <div className="icon-indicator">
      {iconQueue.map((iconProps, i) => {
        return <WeatherIcon key={i} className={className(i)} {...iconProps} />;
      })}
    </div>
  );
};
