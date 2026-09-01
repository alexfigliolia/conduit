import { memo } from "react";
import type { Propless } from "@ui/Types";
import { Search } from "@ui/Components/Search";
import { DailyWeather } from "@ui/Components/DailyWeather";

import "./styles.scss";

export const App = memo(function App(_: Propless) {
  return (
    <main>
      <div className="bg" />
      <Search />
      <DailyWeather />
    </main>
  );
});
