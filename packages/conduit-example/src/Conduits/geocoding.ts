import { Geocoding } from "@ui/API";
import { NetworkConduit } from "@figliolia/conduit";

import { cache } from "./cache";

export const GeocodingConduit = new NetworkConduit({
  key: ["geocoding"],
  cache,
  operation: (query: string) => {
    return Geocoding.fetch(query);
  },
});
