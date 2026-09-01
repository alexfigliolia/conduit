import { LinkedList } from "@figliolia/data-structures";

export class Queue {
  private running = false;
  private readonly queue = new LinkedList<Task>();

  public push(item: Task) {
    const { resolve, promise } = Promise.withResolvers();
    const task = () => {
      resolve(item());
    };
    this.queue.push(task);
    void this.execute();
    return promise;
  }

  private async execute() {
    if (this.running) {
      return;
    }
    while (this.queue.size) {
      if (!this.running) {
        this.running = true;
      }
      await this.queue.shift()?.();
    }
    this.running = false;
  }
}

type Task = () => Promise<void> | void;
