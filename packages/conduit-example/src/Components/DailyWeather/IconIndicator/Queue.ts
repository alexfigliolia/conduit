import type { WeatherIconProps } from "@ui/Components/WeatherIcon";

export class IconQueue extends Array<WeatherIconProps> {
  constructor(...initialItems: WeatherIconProps[]) {
    super();
    this.push(...initialItems);
  }

  public enqueue(item: WeatherIconProps) {
    return new IconQueue(...this, item);
  }

  public dequeue() {
    if (this.isEmpty) {
      return this;
    }

    return new IconQueue(...this.slice(1));
  }

  public peekRight() {
    return this[this.length - 1];
  }

  public peekLeft() {
    return this[0];
  }

  public get isEmpty() {
    return this.length === 0;
  }
}
