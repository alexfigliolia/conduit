import { useEffect } from "react";
import { useController } from "@figliolia/react-hooks";

import { TaskQueue } from "./TaskQueue";

export const useTaskQueue = <T>(
  ...args: ConstructorParameters<typeof TaskQueue<T>>
) => {
  const queue = useController(new TaskQueue<T>(...args));
  queue.configure(...args);

  useEffect(() => {
    return () => queue.clear();
  }, [queue]);

  return queue;
};
