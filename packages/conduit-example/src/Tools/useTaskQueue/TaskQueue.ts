import { Timeout } from "@figliolia/react-hooks";
import { LinkedList } from "@figliolia/data-structures";

export class TaskQueue<T> {
  private paused = false;
  private flushing = false;
  private readonly scheduler = new Timeout();
  private readonly queue = new LinkedList<() => T | undefined>();
  constructor(
    public flushStyle?: FlushStyle,
    public threadGapMilliseconds?: number,
  ) {}

  public enqueue(task: () => T) {
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    this.queue.push(() => {
      try {
        const result = task();
        if (result instanceof Promise) {
          void result.then(resolve).catch(reject);
        }
        resolve(result);
        return result;
      } catch (error) {
        reject(error);
      }
    });
    void this.flush();
    return promise;
  }

  public configure(flushStyle?: FlushStyle, threadGapMilliseconds?: number) {
    this.flushStyle = flushStyle;
    this.threadGapMilliseconds = threadGapMilliseconds;
  }

  private async flush() {
    if (this.flushing) {
      return;
    }
    this.flushing = true;
    while (this.queue.size) {
      if (this.paused) {
        await Promise.resolve();
        continue;
      }
      const task = this.queue.shift();
      if (!task) {
        continue;
      }
      if (typeof this.threadGapMilliseconds === "number") {
        await new Promise(resolve =>
          this.scheduler.execute(resolve, this.threadGapMilliseconds),
        );
      }
      const result = task();
      if (result instanceof Promise) {
        if (this.flushStyle === "concurrent") {
          void result;
        } else {
          await result;
        }
      }
    }
    this.flushing = false;
  }

  public clear() {
    this.paused = true;
    this.scheduler.abortAll();
    while (this.queue.size) {
      this.queue.shift();
    }
    this.paused = false;
    this.flushing = false;
  }
}

export type FlushStyle = "concurrent" | "sync";
