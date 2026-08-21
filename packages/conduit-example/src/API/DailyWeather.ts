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
      "shortwave_radiation_sum",
      "et0_fao_evapotranspiration",
    ],
    hourly: [
      "temperature_2m",
      "rain",
      "showers",
      "snowfall",
      "precipitation",
      "precipitation_probability",
      "apparent_temperature",
      "weather_code",
      "cloud_cover",
      "cloud_cover_low",
      "cloud_cover_mid",
      "cloud_cover_high",
      "visibility",
      "wind_speed_80m",
      "wind_gusts_10m",
      "wind_direction_180m",
    ],
    models: "best_match",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
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
    const utcOffsetSeconds = forecast.utcOffsetSeconds();
    const current = forecast.current()!;
    const hourly = forecast.hourly()!;
    return this.interceptor({
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature_2m: current.variables(0)!.value(),
        relative_humidity_2m: current.variables(1)!.value(),
        apparent_temperature: current.variables(2)!.value(),
        is_day: current.variables(3)!.value(),
        precipitation: current.variables(4)!.value(),
        rain: current.variables(5)!.value(),
        showers: current.variables(6)!.value(),
        snowfall: current.variables(7)!.value(),
        weather_code: current.variables(8)!.value(),
        cloud_cover: current.variables(9)!.value(),
        pressure_msl: current.variables(10)!.value(),
        surface_pressure: current.variables(11)!.value(),
        wind_speed_10m: current.variables(12)!.value(),
        wind_direction_10m: current.variables(13)!.value(),
        wind_gusts_10m: current.variables(14)!.value(),
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
        temperature_2m: hourly.variables(0)!.valuesArray(),
      },
    });
  }

  private static interceptor<T>(value: T) {
    console.log(value);
    return value;
  }
}
