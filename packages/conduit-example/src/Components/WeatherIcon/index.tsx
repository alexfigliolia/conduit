import { memo, useMemo } from "react";
import windGustsCloudy5 from "@ui/WeatherIcons/wind-gusts-cloudy-5.svg";
import unknownPrecipitation2 from "@ui/WeatherIcons/unknown-precipitation-2.svg";
import sunny from "@ui/WeatherIcons/sunny.svg";
import shower from "@ui/WeatherIcons/shower.svg";
import partlyCloudy from "@ui/WeatherIcons/partly-cloudy.svg";
import partlyCloudyNight from "@ui/WeatherIcons/partly-cloudy-night.svg";
import hail from "@ui/WeatherIcons/hail.svg";
import dustSand from "@ui/WeatherIcons/dust-sand.svg";
import drops from "@ui/WeatherIcons/drops.svg";
import cloud from "@ui/WeatherIcons/cloudy.svg";
import clearNight from "@ui/WeatherIcons/clear-night.svg";

// TODO - add alt text
export const WeatherIcon = memo(({ code, night }: Props) => {
  const icon = useMemo(() => {
    switch (code) {
      case 0: {
        if (night) {
          return clearNight;
        }
        return sunny;
      }
      case 1:
      case 2: {
        if (night) {
          return partlyCloudyNight;
        }
        return partlyCloudy;
      }
      case 3:
        return cloud;
      case 4:
        return windGustsCloudy5;
      case 5:
        return unknownPrecipitation2;
      case 6:
        return hail;
      case 7:
        return dustSand;
      case 8:
        return shower;
      case 9:
        return unknownPrecipitation2;
      case 10:
      default:
        return drops;
    }
  }, [code, night]);
  return <img src={icon} />;
});

interface Props {
  code: number;
  night?: boolean;
}
