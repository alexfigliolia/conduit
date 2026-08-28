import { fetchWeatherApi } from "openmeteo";

import type { ILocation } from "./types";

export class DailyWeather {
  public static readonly PARAMS = {
    latitude: 52.52,
    longitude: 13.41,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "uv_index_max",
      "uv_index_clear_sky_max",
      "sunrise",
      "sunset",
      "daylight_duration",
      "sunshine_duration",
      "moonrise",
      "moonset",
      "moon_phase",
      "rain_sum",
      "showers_sum",
      "snowfall_sum",
      "precipitation_sum",
      "precipitation_hours",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "wind_direction_10m_dominant",
      "temperature_2m_mean",
      "apparent_temperature_mean",
      "cloud_cover_mean",
      "cloud_cover_max",
      "cloud_cover_min",
      "precipitation_probability_mean",
      "precipitation_probability_min",
      "relative_humidity_2m_mean",
      "relative_humidity_2m_min",
      "relative_humidity_2m_max",
      "snowfall_water_equivalent_sum",
      "wind_speed_10m_min",
      "wind_gusts_10m_min",
      "wind_speed_10m_mean",
      "wind_gusts_10m_mean",
      "visibility_max",
      "visibility_min",
      "visibility_mean",
    ],
    hourly: [
      "weather_code",
      "cloud_cover",
      "cloud_cover_low",
      "cloud_cover_mid",
      "cloud_cover_high",
      "visibility",
      "wind_speed_180m",
      "wind_direction_180m",
      "temperature_180m",
      "uv_index",
      "uv_index_clear_sky",
      "is_day",
      "sunshine_duration",
      "snow_depth",
      "snowfall",
      "rain",
      "showers",
      "precipitation",
      "precipitation_probability",
      "apparent_temperature",
      "dew_point_2m",
      "relative_humidity_2m",
      "temperature_2m",
    ],
    models: "best_match",
    current: [
      "is_day",
      "apparent_temperature",
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ],
    wind_speed_unit: "mph",
    temperature_unit: "fahrenheit",
    precipitation_unit: "inch",
  };
  public static readonly URL = "https://api.open-meteo.com/v1/forecast";

  public static async fetch(location?: ILocation) {
    const response = await fetchWeatherApi(this.URL, {
      ...this.PARAMS,
      ...location,
    });
    const forecast = response[0];
    if (!forecast) {
      return undefined;
    }
    const utcOffsetSeconds = forecast.utcOffsetSeconds();
    const current = forecast.current()!;
    const hourly = forecast.hourly()!;
    const daily = forecast.daily()!;
    const sunrise = daily.variables(7)!;
    const sunset = daily.variables(8)!;
    const moonrise = daily.variables(11)!;
    const moonset = daily.variables(12)!;
    const missingInt64 = 9223372036854775807n;
    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        is_day: current.variables(0)!.value(),
        apparent_temperature: current.variables(1)!.value(),
        temperature_2m: current.variables(2)!.value(),
        relative_humidity_2m: current.variables(3)!.value(),
        precipitation: current.variables(4)!.value(),
        rain: current.variables(5)!.value(),
        showers: current.variables(6)!.value(),
        snowfall: current.variables(7)!.value(),
        weather_code: current.variables(8)!.value(),
        cloud_cover: current.variables(9)!.value(),
        surface_pressure: current.variables(10)!.value(),
        wind_speed_10m: current.variables(11)!.value(),
        wind_direction_10m: current.variables(12)!.value(),
        wind_gusts_10m: current.variables(13)!.value(),
      },
      hourly: {
        time: Array.from(
          {
            length:
              (Number(hourly.timeEnd()) - Number(hourly.time())) /
              hourly.interval(),
          },
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000,
            ),
        ),
        weather_code: hourly.variables(0)!.valuesArray(),
        cloud_cover: hourly.variables(1)!.valuesArray(),
        cloud_cover_low: hourly.variables(2)!.valuesArray(),
        cloud_cover_mid: hourly.variables(3)!.valuesArray(),
        cloud_cover_high: hourly.variables(4)!.valuesArray(),
        visibility: hourly.variables(5)!.valuesArray(),
        wind_speed_180m: hourly.variables(6)!.valuesArray(),
        wind_direction_180m: hourly.variables(7)!.valuesArray(),
        temperature_180m: hourly.variables(8)!.valuesArray(),
        uv_index: hourly.variables(9)!.valuesArray(),
        uv_index_clear_sky: hourly.variables(10)!.valuesArray(),
        is_day: hourly.variables(11)!.valuesArray(),
        sunshine_duration: hourly.variables(12)!.valuesArray(),
        snow_depth: hourly.variables(13)!.valuesArray(),
        snowfall: hourly.variables(14)!.valuesArray(),
        rain: hourly.variables(15)!.valuesArray(),
        showers: hourly.variables(16)!.valuesArray(),
        precipitation: hourly.variables(17)!.valuesArray(),
        precipitation_probability: hourly.variables(18)!.valuesArray(),
        apparent_temperature: hourly.variables(19)!.valuesArray(),
        dew_point_2m: hourly.variables(20)!.valuesArray(),
        relative_humidity_2m: hourly.variables(21)!.valuesArray(),
        temperature_2m: hourly.variables(22)!.valuesArray(),
      },
      daily: {
        time: Array.from(
          {
            length:
              (Number(daily.timeEnd()) - Number(daily.time())) /
              daily.interval(),
          },
          (_, i) =>
            new Date(
              (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
                1000,
            ),
        ),
        weather_code: daily.variables(0)!.valuesArray(),
        temperature_2m_max: daily.variables(1)!.valuesArray(),
        temperature_2m_min: daily.variables(2)!.valuesArray(),
        apparent_temperature_max: daily.variables(3)!.valuesArray(),
        apparent_temperature_min: daily.variables(4)!.valuesArray(),
        uv_index_max: daily.variables(5)!.valuesArray(),
        uv_index_clear_sky_max: daily.variables(6)!.valuesArray(),
        sunrise: [...Array(sunrise.valuesInt64Length())].map(
          (_, i) =>
            new Date(
              (Number(sunrise.valuesInt64(i)) + utcOffsetSeconds) * 1000,
            ),
        ),
        sunset: [...Array(sunset.valuesInt64Length())].map(
          (_, i) =>
            new Date((Number(sunset.valuesInt64(i)) + utcOffsetSeconds) * 1000),
        ),
        daylight_duration: daily.variables(9)!.valuesArray(),
        sunshine_duration: daily.variables(10)!.valuesArray(),
        moonrise: [...Array(moonrise.valuesInt64Length())].map((_, i) => {
          const value = moonrise.valuesInt64(i)!;
          return value === missingInt64
            ? null
            : new Date((Number(value) + utcOffsetSeconds) * 1000);
        }),
        moonset: [...Array(moonset.valuesInt64Length())].map((_, i) => {
          const value = moonset.valuesInt64(i)!;
          return value === missingInt64
            ? null
            : new Date((Number(value) + utcOffsetSeconds) * 1000);
        }),
        moon_phase: daily.variables(13)!.valuesArray(),
        rain_sum: daily.variables(14)!.valuesArray(),
        showers_sum: daily.variables(15)!.valuesArray(),
        snowfall_sum: daily.variables(16)!.valuesArray(),
        precipitation_sum: daily.variables(17)!.valuesArray(),
        precipitation_hours: daily.variables(18)!.valuesArray(),
        precipitation_probability_max: daily.variables(19)!.valuesArray(),
        wind_speed_10m_max: daily.variables(20)!.valuesArray(),
        wind_gusts_10m_max: daily.variables(21)!.valuesArray(),
        wind_direction_10m_dominant: daily.variables(22)!.valuesArray(),
        temperature_2m_mean: daily.variables(23)!.valuesArray(),
        apparent_temperature_mean: daily.variables(24)!.valuesArray(),
        cloud_cover_mean: daily.variables(25)!.valuesArray(),
        cloud_cover_max: daily.variables(26)!.valuesArray(),
        cloud_cover_min: daily.variables(27)!.valuesArray(),
        precipitation_probability_mean: daily.variables(28)!.valuesArray(),
        precipitation_probability_min: daily.variables(29)!.valuesArray(),
        relative_humidity_2m_mean: daily.variables(30)!.valuesArray(),
        relative_humidity_2m_min: daily.variables(31)!.valuesArray(),
        relative_humidity_2m_max: daily.variables(32)!.valuesArray(),
        snowfall_water_equivalent_sum: daily.variables(33)!.valuesArray(),
        wind_speed_10m_min: daily.variables(34)!.valuesArray(),
        wind_gusts_10m_min: daily.variables(35)!.valuesArray(),
        wind_speed_10m_mean: daily.variables(36)!.valuesArray(),
        wind_gusts_10m_mean: daily.variables(37)!.valuesArray(),
        visibility_max: daily.variables(38)!.valuesArray(),
        visibility_min: daily.variables(39)!.valuesArray(),
        visibility_mean: daily.variables(40)!.valuesArray(),
      },
    } as const;
    return weatherData;
  }
}
