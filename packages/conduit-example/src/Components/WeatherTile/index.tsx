import "./styles.scss";

export const WeatherTile = ({ loading, weather }: Props) => {
  const {
    temperature = 0,
    precipitation = 0,
    humidity = 0,
    windSpeed = 0,
  } = weather ?? {};

  return <div className="weather-tile"></div>;
};

interface Props {
  loading: boolean;
  weather?: DailyWeather;
}

export interface DailyWeather {
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}
