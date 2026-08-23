export class KeyStack {
  private isActive = false;
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
      this.isActive = true;
    } else if (this.isActive && !KeyStack.INTERACTION_KEYS.includes(key)) {
      this.isActive = false;
    }
  }

  public deactivate() {
    this.isActive = false;
  }

  public isInteracting() {
    return this.isActive;
  }
}
