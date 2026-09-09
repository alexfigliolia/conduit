# Conduit React

React bindings for Conduit

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [useConduit](#useconduit)
4. [useInfiniteConduit](#useinfiniteconduit)
5. [Example React Application](#example-react-application)

## Installation

If you haven't already, install [conduit and its peer dependencies](https://github.com/alexfigliolia/conduit/blob/main/README.md#installation)

Next, install Conduit's react bindings

```bash
npm i -S @figliolia/conduit-react
```

## Basic Usage

This library comes with hooks for consuming conduit values in react applications. Most commonly, you'll interface with `useConduit()` and/or `useInfiniteConduit()`.

`useConduit()` will allow you to consume `Conduit` and `NetworkConduit` instances, while `useInfiniteConduit()` will allow you to consume `InfiniteConduits` and `InfiniteNetworkConduits`

For the following example, we'll assume we're using the following conduit for fetching weather data

```typescript
import { Conduit, Cache } from "@figliolia/conduit";

export const QueryCache = new Cache();

export const WeatherConduit = new Conduit({
  key: ["weather-forecast"],
  cache: QueryCache,
  defaultValue: [],
  operation: async (latitude: number, longitude: number) => {
    const response = await fetch("https://api.open-meteo.com/v1/forecast", {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    });
    return response.json();
  },
});
```

### useConduit

```tsx
import { memo, useCallback, useMemo, useRef } from "react";
import { WeatherConduit } from "./MyWeatherConduit";
import { useConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";

export const DailyWeather = memo((_: Propless) => {
  const [location] = useLocation();

  const { value, status, refetch } = useConduit(WeatherConduit, {
    args: [location],
    // skip query when location is unavailable
    skipWhen: !location,
  });

  return (
    <section
      className="daily-weather"
      aria-label="Daily Weather Forecasts for the next 7 days">
      {status === ConduitStatus.IN_FLIGHT && <Spinner />}
      {value.map((day, i) => {
        return (
          <div key={day} className="day">
            <span>{day.dayOfWeek}</span>
            <WeatherIcon icon={day.icon} />
            <Temperature value={value.minTemperature} />
            <Viz data={day.graph} />
            <Temperature value={value.maxTemperature} />
          </div>
        );
      })}
    </section>
  );
});

function useLocation() {
  const [location, setLocation] = useState(undefined);

  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
    });
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return [location, refreshLocation];
}
```

### useInfiniteConduit

This API mirrors `useConduit()` with the exception of requiing an `InfiniteConduit` or `InfiniteNetworkConduit` to be passed to it.

`useInfiniteConduit` will return an array of data entries corresponding with your operation results

```tsx
import { addDays } from "date-fns";
import { memo, useCallback, useMemo, useRef } from "react";
import { InfiniteWeatherConduit } from "./MyWeatherConduit";
import { useInfiniteConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";

const today = new Date();

export const DailyWeather = memo((_: Propless) => {
  const [location] = useLocation();
  const [currentDate, setCurrentDate] = useState(today);

  const fetchNextDay = () => {
    setCurrentDate(previous => addDays(previous, 1));
  };

  const { value, status, refetch } = useInfiniteConduit(
    InfiniteWeatherConduit,
    {
      // assume currentDate is the pagination argument
      args: { location, currentDate },
      // skip query when location is unavailable
      skipWhen: !location,
    },
  );

  return (
    <section
      className="daily-weather"
      aria-label="Daily Weather Forecasts for the next 7 days">
      {value.map((day, i) => {
        return (
          <div key={day} className="day">
            <span>{day.dayOfWeek}</span>
            <WeatherIcon icon={day.icon} />
            <Temperature value={value.minTemperature} />
            <Viz data={day.graph} />
            <Temperature value={value.maxTemperature} />
          </div>
        );
      })}
      <button onClick={fetchNextDay}>Get Next Day</button>
    </section>
  );
});
```

## Example React Application

To see Conduit in a simple react application you can head over to [the example app](https://github.com/alexfigliolia/conduit/blob/main/packages/conduit-example).

To run the app, you can clone this repository and run:

```bash
pnpm i && pnpm setup:repo && repokit example vite:install && repokit example dev
```
