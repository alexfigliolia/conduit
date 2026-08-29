import {
  scaleBand,
  scaleLinear,
  select,
  type BaseType,
  type ScaleBand,
  type ScaleLinear,
  type Selection,
} from "d3";

export class BoxPlotChart<T, R extends BoxCompute = BoxCompute> {
  public static readonly EMPTY = {
    min: 0,
    max: 0,
    median: 0,
    quantLow: 0,
    quantHigh: 0,
    interQuantileRange: 0,
  } as const;
  constructor(
    public readonly nodeID: string,
    public readonly compute: Compute<T, R>,
  ) {}

  public render(data: T) {
    const { root, width, height } = this.getRoot();
    const boxData = this.compute(data);
    const { xScale, yScale } = this.createScales(width, height, boxData);
    const line = this.renderLine(root, width, yScale);
    const box = this.renderBox(root, xScale, yScale, boxData);
    return {
      root: root.node()!,
      line,
      box,
      xScale,
      yScale,
      width,
      height,
      ...boxData,
    };
  }

  private renderBox(
    root: SVGNode<T>,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleBand<string>,
    data: BoxCompute,
  ) {
    let rect: SVGNode<T, SVGRectElement>;
    if (root.node()?.querySelector?.(".box")) {
      rect = root.select(".box");
    } else {
      rect = root.append("rect").attr("class", "box");
    }
    const height = yScale.bandwidth();
    const radius = height / 2;
    rect
      .transition()
      .duration(750)
      .attr("x", xScale(data.quantLow))
      .attr("width", xScale(data.quantHigh) - xScale(data.quantLow))
      .attr("y", 0)
      .attr("height", height)
      .attr("rx", radius)
      .attr("ry", radius);
    return rect.node()!;
  }

  private renderLine(
    root: SVGNode<T>,
    width: number,
    yScale: ScaleBand<string>,
  ) {
    let line: SVGNode<T, SVGRectElement>;
    if (root.node()?.querySelector?.(".line")) {
      line = root.select(".line");
    } else {
      line = root.append("rect").attr("class", "line");
    }
    const height = yScale.bandwidth();
    const radius = height / 2;
    line
      .attr("x", 0)
      .attr("width", width)
      .attr("y", 0)
      .attr("height", height)
      .attr("rx", radius)
      .attr("ry", radius);
    return line.node()!;
  }

  private getRoot() {
    const root: SVGNode<T> = select(`#${this.nodeID}`);
    const node = root.node();
    if (!node) {
      throw new Error(
        `Box Plot Error: Root node with id "${this.nodeID}" not found`,
      );
    }
    const { width, height } = node.getBoundingClientRect();
    return { root, width, height };
  }

  private createScales(width: number, height: number, data: BoxCompute) {
    return {
      yScale: scaleBand().range([height, 0]),
      xScale: scaleLinear().domain([data.min, data.max]).range([0, width]),
    };
  }
}

export interface BoxCompute {
  min: number;
  max: number;
  median: number;
  quantLow: number;
  quantHigh: number;
  interQuantileRange: number;
}

export type Compute<T, R extends BoxCompute = BoxCompute> = (data: T) => R;

export type SVGNode<
  T = unknown,
  E extends BaseType = SVGSVGElement,
> = Selection<E, T, HTMLElement, any>;

export type BoxPlotRenderResult<
  T,
  R extends BoxCompute = BoxCompute,
> = ReturnType<BoxPlotChart<T, R>["render"]>;
