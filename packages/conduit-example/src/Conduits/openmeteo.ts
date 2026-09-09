import { DailyWeather, type ILocation } from "@ui/API";
import { Conduit } from "@figliolia/conduit";

import { cache } from "./cache";

export const DailyWeatherConduit = new Conduit({
  cache,
  key: ["daily-weather"],
  operation: (location?: ILocation) => {
    if (!location) {
      return;
    }
    return DailyWeather.fetch(location);
  },
});
