import { DailyWeather, type ILocation } from "@ui/API";
import { Conduit } from "@figliolia/conduit";

import { cache } from "./cache";

export const DailyWeatherConduit = new Conduit({
  cache,
  defaultValue: undefined,
  key: ["daily-weather"],
  operation: (location?: ILocation) => {
    return DailyWeather.fetch(location);
  },
});
