import { memo, useMemo } from "react";
import type { Propless } from "@ui/Types";
import { DailyWeatherConduit } from "@ui/Conduits";
import { WeatherTile, type DailyWeather } from "@ui/Components/WeatherTile";
import { Search } from "@ui/Components/Search";
import { BackgroundImage } from "@ui/Components/BackgroundImage";
// import { WeatherTile } from "@ui/Components/WeatherTile";
import { useConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";

export const App = memo(function App(_: Propless) {
  const { value, status } = useConduit(DailyWeatherConduit, {
    args: [{ latitude: 0, longitude: 0 }],
  });

  const weather: DailyWeather | undefined = useMemo(
    () =>
      value
        ? {
            temperature: value.apparent_temperature,
            precipitation: value.precipitation,
            humidity: value.relative_humidity_2m,
            windSpeed: value.wind_speed_10m,
          }
        : undefined,
    [value],
  );

  return (
    <BackgroundImage Tag="main">
      <Search />
      <WeatherTile weather={weather} loading={status !== ConduitStatus.IDOL} />
    </BackgroundImage>
  );
});
