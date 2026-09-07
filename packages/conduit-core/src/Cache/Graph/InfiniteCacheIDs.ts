import { AutoIncrementingID } from "@figliolia/event-emitter";

export class InfiniteCacheIDs extends AutoIncrementingID {
  constructor(lastID?: string) {
    super();
    if (
      typeof lastID === "undefined" ||
      lastID === null ||
      isNaN(lastID as unknown as number)
    ) {
      return;
    }
    if (typeof lastID === "bigint") {
      this["incrementor"] = BigInt(lastID);
    } else {
      this["incrementor"] = parseInt(lastID);
    }
  }
}
