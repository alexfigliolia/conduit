import { Fragment, memo, useCallback, useMemo, useState } from "react";
import type { Propless } from "@ui/Types";
import { Location } from "@ui/State";
import { GeocodingConduit } from "@ui/Conduits";
import { Search } from "@ui/Components/Search";
import { DailyWeather } from "@ui/Components/DailyWeather";
import { useConduit } from "@figliolia/conduit-react";

export const Weather = memo(function (_: Propless) {
  const [query, setQuery] = useState("");

  const { value, status } = useConduit(GeocodingConduit, {
    args: [query],
    skipWhen: !query.length,
  });

  const setCoordinates = useCallback((position: (typeof options)[number]) => {
    Location.set({ latitude: position.lat, longitude: position.lon });
  }, []);

  const options = useMemo(
    () =>
      value?.data?.map?.(item => ({ ...item, value: item.display_name })) ?? [],
    [value],
  );

  return (
    <Fragment>
      <Search
        options={options}
        status={status}
        onSearchQueryChange={setQuery}
        onSelectionChange={setCoordinates}
      />
      <DailyWeather />
    </Fragment>
  );
});
