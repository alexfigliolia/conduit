import { memo } from "react";
import { Weather } from "@ui/Views/Weather";
// import { Jobs } from "@ui/Views/Jobs";
import type { Propless } from "@ui/Types";

import "./styles.scss";

export const App = memo(function App(_: Propless) {
  return (
    <main>
      <div className="bg" />
      {/* <Jobs /> */}
      <Weather />
    </main>
  );
});
