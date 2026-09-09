export class CSS {
  public static durationToFloat(duration: string) {
    const float = parseFloat(duration);
    if (isNaN(float)) {
      throw new Error(`Cannot convert ${duration} into a javascript number`);
    }
    if (/ms/gi.test(duration)) {
      return float;
    }
    return float * 1000;
  }
}
