import { EventEmitter } from "@figliolia/event-emitter";

export class KeyStack {
  private isActive = false;
  private readonly Emitter = new EventEmitter<{ active: boolean }>();
  public static readonly ACTIVATION_KEYS = [
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  public static readonly INTERACTION_KEYS = [
    ...this.ACTIVATION_KEYS,
    "Enter",
    " ",
  ];

  public push(key: string) {
    if (!this.isActive && KeyStack.ACTIVATION_KEYS.includes(key)) {
      this.setActive(true);
    } else if (this.isActive && !KeyStack.INTERACTION_KEYS.includes(key)) {
      console.log("deactivating on non-interaction key");
      this.setActive(false);
    }
  }

  public setActive(active: boolean) {
    this.isActive = active;
    this.emit();
  }

  public readonly isInteracting = () => {
    return this.isActive;
  };

  public readonly subscribe = (cb: (active: boolean) => void) => {
    const ID = this.Emitter.on("active", cb);
    return () => {
      this.Emitter.off("active", ID);
    };
  };

  private emit() {
    this.Emitter.emit("active", this.isActive);
  }
}
