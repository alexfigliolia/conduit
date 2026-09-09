import { JobListings } from "@ui/API/JobListings";
import { InfiniteNetworkConduit } from "@figliolia/conduit";

import { cache } from "./cache";

export const JobListingsConduit = new InfiniteNetworkConduit({
  cache,
  key: ["job-listings"],
  paginationArgs: ["cursor"],
  operation: (config: { search: string; cursor?: string }) =>
    JobListings.fetch(config.search, config.cursor),
});
