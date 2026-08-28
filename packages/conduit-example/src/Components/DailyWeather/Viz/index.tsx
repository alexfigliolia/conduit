import { useCallback, useEffect, useId, useState } from "react";
import { BoxPlot, type BoxPlotRenderResult } from "@ui/Components/BoxPlot";

import { ColorScale } from "./ColorScale";

import "./styles.scss";

export const Viz = ({ data }: Props) => {
  const gradientID = useId();
  const [box, setBox] = useState<SVGRectElement | null>(null);
  const [endColor, setEndColor] = useState("transparent");
  const [startColor, setStartColor] = useState("transparent");

  const onRender = useCallback((result: BoxPlotRenderResult<number[]>) => {
    setBox(result.box);
    const { startColor, endColor } = ColorScale.resolve(result.min, result.max);
    setStartColor(startColor);
    setEndColor(endColor);
  }, []);

  useEffect(() => {
    if (box) {
      box.style.fill = `url(#${gradientID})`;
    }
  }, [box, gradientID, endColor, startColor]);

  return (
    <div
      className="daily-weather-viz"
      style={{ "--end-color": endColor, "--start-color": startColor }}>
      <BoxPlot data={data} onRender={onRender}>
        <linearGradient id={gradientID}>
          <stop offset={0} stopColor={startColor} />
          <stop offset={1} stopColor={endColor} />
        </linearGradient>
      </BoxPlot>
    </div>
  );
};

interface Props {
  data: number[];
}
