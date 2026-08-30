import { memo, useMemo } from "react";
import windGustsCloudy from "@ui/WeatherIcons/wind-gusts-cloudy.svg";
import windGustsCloudy5 from "@ui/WeatherIcons/wind-gusts-cloudy-5.svg";
import unknownPrecipitation2 from "@ui/WeatherIcons/unknown-precipitation-2.svg";
import sunny from "@ui/WeatherIcons/sunny.svg";
import shower from "@ui/WeatherIcons/shower.svg";
import rain2 from "@ui/WeatherIcons/rain-3.svg";
import rain3 from "@ui/WeatherIcons/rain-3.svg";
import partlyCloudy from "@ui/WeatherIcons/partly-cloudy.svg";
import partlyCloudyNight from "@ui/WeatherIcons/partly-cloudy-night.svg";
import nightShower from "@ui/WeatherIcons/night-shower-2.svg";
import lightDrizzle from "@ui/WeatherIcons/light-drizzle.svg";
import heavyRain from "@ui/WeatherIcons/heavy-rain-2.svg";
import hail from "@ui/WeatherIcons/hail.svg";
import dustSand from "@ui/WeatherIcons/dust-sand.svg";
import drops from "@ui/WeatherIcons/drops.svg";
import drizzle from "@ui/WeatherIcons/drizzle.svg";
import cloud from "@ui/WeatherIcons/cloudy.svg";
import cloudyNight from "@ui/WeatherIcons/cloudy-night.svg";
import clearNight from "@ui/WeatherIcons/clear-night.svg";

// TODO - add alt text
export const WeatherIcon = memo(
  ({ code, night, className }: WeatherIconProps) => {
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
          if (night) {
            return cloudyNight;
          }
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
        case 55:
        case 80:
          if (night) {
            return nightShower;
          }
          return shower;
        case 9:
          return unknownPrecipitation2;
        case 10:
          return drops;
        case 45:
          return windGustsCloudy;
        case 51:
          return lightDrizzle;
        case 53:
          return drizzle;
        case 61:
          if (night) {
            return nightShower;
          }
          return rain2;
        case 62:
        case 63:
          if (night) {
            return nightShower;
          }
          return rain3;
        case 81:
          return heavyRain;
        default:
          console.log("unknown weather code", code);
          return sunny;
      }
    }, [code, night]);
    return <img src={icon} className={className} />;
  },
);

export interface WeatherIconProps {
  code: number;
  night?: boolean;
  className?: string;
}
