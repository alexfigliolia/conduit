import {
  addDays,
  toLocaleString,
  diffDays,
} from "temporal-polyfill/fns/PlainDate";
import { memo, useCallback, useMemo, useRef } from "react";
import type { Propless } from "@ui/Types";
import { Dates } from "@ui/Tools/Dates";
import { useLocation } from "@ui/State";
import { DailyWeatherConduit } from "@ui/Conduits";
import { GlassContainer } from "@ui/Components/GlassContainer";
import { useLocale } from "@figliolia/react-hooks";
import { useConduit } from "@figliolia/conduit-react";

import { Viz } from "./Viz";
import { Temperature } from "./Temperature";
import { IconIndicator } from "./IconIndicator";

import "./styles.scss";

export const DailyWeather = memo((_: Propless) => {
  const location = useLocation();
  const locale = useLocale("en-us");
  const hasResolved = useRef(false);

  const { value } = useConduit(DailyWeatherConduit, {
    args: [location],
    skipWhen: !location,
  });

  if (value && !hasResolved.current) {
    hasResolved.current = true;
  }

  const time = useMemo(
    () => value?.current?.time ?? new Date(),
    [value?.current?.time],
  );

  const date = useMemo(() => Dates.from(time), [time]);

  const isNight = useCallback((date: Date) => date.getHours() >= 18, []);

  const dayNames = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        toLocaleString(addDays(date, i), locale, { weekday: "long" }),
      ),
    [date, locale],
  );

  const hourlyWeatherPoints = useMemo(() => {
    const buckets: number[][] = Array.from({ length: 7 }, () => []);
    const times = value?.hourly?.time ?? [];
    const temps = value?.hourly?.apparent_temperature ?? [];
    const { length } = times;
    for (let i = 0; i < length; i++) {
      const temporal = Dates.from(times[i]);
      const elapsedDays = diffDays(date, temporal);
      if (buckets[elapsedDays] && typeof temps[i] !== "undefined") {
        buckets[elapsedDays].push(temps[i]);
      }
    }
    return buckets;
  }, [date, value?.hourly?.time, value?.hourly?.apparent_temperature]);

  return (
    <section
      className="daily-weather"
      aria-label="Daily Weather Forecasts for the next 7 days">
      {dayNames.map((day, i) => {
        const time = value?.daily?.time[0];
        const night = time ? isNight(time) : false;
        return (
          <GlassContainer key={day} Tag="div" className="daily-weather__day">
            <span>{i === 0 ? "Today" : day.slice(0, 3)}</span>
            <div>
              {hasResolved.current ? (
                <IconIndicator
                  night={night}
                  code={value?.daily?.weather_code?.[i] ?? 0}
                />
              ) : (
                <div className="img-placeholder" />
              )}
              <div className="temp">
                <Temperature
                  resolved={hasResolved.current}
                  value={value?.daily?.apparent_temperature_min?.[i] ?? 0}
                />
                <Viz data={hourlyWeatherPoints[i]} />
                <Temperature
                  resolved={hasResolved.current}
                  value={value?.daily?.apparent_temperature_max?.[i] ?? 0}
                />
              </div>
            </div>
          </GlassContainer>
        );
      })}
    </section>
  );
});
