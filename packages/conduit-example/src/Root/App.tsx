import { memo, useMemo } from "react";
import type { Propless } from "@ui/Types";
import { useLocation } from "@ui/State";
import { DailyWeatherConduit } from "@ui/Conduits";
import { WeatherTile, type DailyWeather } from "@ui/Components/WeatherTile";
import { Search } from "@ui/Components/Search";
import { BackgroundImage } from "@ui/Components/BackgroundImage";
import { useConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";

export const App = memo(function App(_: Propless) {
  const location = useLocation();

  const { value, status } = useConduit(DailyWeatherConduit, {
    args: [location],
  });

  const weather: DailyWeather | undefined = useMemo(
    () =>
      value
        ? {
            temperature: value.current.apparent_temperature,
            precipitation: value.current.precipitation,
            humidity: value.current.relative_humidity_2m,
            windSpeed: value.current.wind_speed_10m,
          }
        : undefined,
    [value],
  );

  console.log({ weather });

  return (
    <BackgroundImage Tag="main">
      <Search />
      <WeatherTile weather={weather} loading={status !== ConduitStatus.IDOL} />
    </BackgroundImage>
  );
});
