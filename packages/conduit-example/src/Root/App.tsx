import { memo } from "react";
import type { Propless } from "@ui/Types";
import { Search } from "@ui/Components/Search";
import { DailyWeather } from "@ui/Components/DailyWeather";
import { BackgroundImage } from "@ui/Components/BackgroundImage";

import "./styles.scss";

export const App = memo(function App(_: Propless) {
  return (
    <BackgroundImage Tag="main" className="app">
      <Search />
      <DailyWeather />
    </BackgroundImage>
  );
});
