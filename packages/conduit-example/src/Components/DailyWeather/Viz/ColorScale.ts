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
    let startColor = this.COLD.color;
    let endColor = startColor;
    let startIndex = 0;
    let endIndex = this.RESOLVERS.length - 1;
    while (startIndex <= endIndex) {
      if (min >= this.RESOLVERS[startIndex].threshold) {
        startColor = this.RESOLVERS[startIndex].color;
      }
      startIndex++;
      if (max >= this.RESOLVERS[endIndex].threshold) {
        endColor = this.RESOLVERS[endIndex].color;
      }
      endIndex--;
    }
    return { startColor, endColor };
  }
}
