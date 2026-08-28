export class ColorScale {
  public static readonly COLD = {
    color: "#2fb6ff",
    threshold: 45,
  };
  public static readonly CHILL = {
    color: "#27dc99",
    threshold: 50,
  };
  public static readonly EHHH = {
    color: "#f1fa48",
    threshold: 60,
  };
  public static readonly HOT = {
    color: "#fb445a",
    threshold: 70,
  };

  public static readonly RESOLVERS = [
    this.COLD,
    this.CHILL,
    this.EHHH,
    this.HOT,
  ];

  public static resolve(min: number, max: number) {
    return {
      startColor: this.resolveBottomUp(min),
      endColor: this.resolveTopDown(max),
    };
  }

  private static resolveBottomUp(value: number) {
    let current = this.COLD.color;
    const { length } = this.RESOLVERS;
    for (let i = 0; i < length; i++) {
      if (value >= this.RESOLVERS[i].threshold) {
        current = this.RESOLVERS[i].color;
      }
    }
    return current;
  }

  private static resolveTopDown(value: number) {
    const { length } = this.RESOLVERS;
    for (let i = length - 1; i > -1; i--) {
      if (value >= this.RESOLVERS[i].threshold) {
        return this.RESOLVERS[i].color;
      }
    }
    return "transparent";
  }
}
