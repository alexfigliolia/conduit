import {
  useEffect,
  useEffectEvent,
  useId,
  type PropsWithChildren,
} from "react";
import { ascending, quantile } from "d3";
import { useSizeObserver } from "@figliolia/size-observer";
import { useController, useDebouncer } from "@figliolia/react-hooks";

import {
  BoxPlotChart,
  type BoxCompute,
  type BoxPlotRenderResult,
} from "./BoxPlot";

export function BoxPlot<T, R extends BoxCompute = BoxCompute>({
  data,
  derive,
  onRender,
  children,
}: Props<T, R>) {
  const nodeID = useId();

  const chart = useController(
    new BoxPlotChart(nodeID, (domain: number[]) => {
      if (!domain.length) {
        return { ...BoxPlotChart.EMPTY, ...derive?.(BoxPlotChart.EMPTY) };
      }
      domain.sort(ascending);
      const quantLow = quantile(domain, 0.25)!;
      const median = quantile(domain, 0.5)!;
      const quantHigh = quantile(domain, 0.75)!;
      const interQuantileRange = quantHigh - quantLow;
      const min = Math.min.apply(null, domain);
      const max = Math.max.apply(null, domain);
      const result = {
        min,
        max,
        domain,
        median,
        quantLow,
        quantHigh,
        interQuantileRange,
      };
      return { ...result, ...derive?.(result) };
    }),
  );

  const render = useEffectEvent((data: number[]) => {
    const result = (chart.render(data) ?? null) as BoxPlotRenderResult<T, R>;
    onRender?.(result);
  });

  const debouncedRender = useDebouncer((data: number[]) => render(data), 100);

  const node = useSizeObserver<SVGSVGElement>({
    width: true,
    onChange: () => debouncedRender.execute(data),
  });

  useEffect(() => {
    render(data);
  }, [data]);

  return (
    <svg ref={node} id={nodeID}>
      {children}
    </svg>
  );
}

export type Props<T, R extends BoxCompute = BoxCompute> = PropsWithChildren<{
  data: number[];
  derive?: (compute: BoxCompute) => T;
  onRender?: (value: BoxPlotRenderResult<T, R>) => void;
}>;

export * from "./BoxPlot";
