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

  public static resolve(min: number, median: number, max: number) {
    const maxIndex = this.RESOLVERS.length - 1;
    let breakStart = false;
    let breakEnd = false;
    let startColor = this.COLD.color;
    let endColor = this.HOT.color;
    let startIndex = 0;
    let endIndex = maxIndex;
    let startColorIndex = startIndex;
    let endColorIndex = endIndex;
    while (startIndex <= endIndex && !(breakEnd && breakStart)) {
      if (min >= this.RESOLVERS[startIndex].threshold) {
        startColor = this.RESOLVERS[startIndex].color;
        startColorIndex = startIndex;
        startIndex++;
      } else {
        breakStart = true;
      }
      if (max <= this.RESOLVERS[endIndex].threshold) {
        endColor = this.RESOLVERS[endIndex].color;
        endColorIndex = endIndex;
        endIndex--;
      } else {
        breakEnd = true;
      }
    }
    if (
      endColorIndex - startColorIndex > 1 ||
      endColorIndex - startColorIndex === 0
    ) {
      const medianDistanceFromMin = median - min;
      const medianDistanceFromMax = max - median;
      if (
        medianDistanceFromMax <= medianDistanceFromMin ||
        (endColorIndex === maxIndex && startColorIndex === maxIndex)
      ) {
        startColor = this.RESOLVERS[Math.max(endColorIndex - 1, 0)].color;
      } else {
        endColor =
          this.RESOLVERS[
            Math.min(startColorIndex + 1, this.RESOLVERS.length - 1)
          ].color;
      }
    }
    return { startColor, endColor };
  }
}
