import type { UnknownCacheAbstract } from "../../Cache";

import type { IInfiniteConduitValue } from "./types";
import type { InfiniteConduitPage } from "./InfiniteConduitPage";

export class InfiniteConduitValue<T, C extends UnknownCacheAbstract> {
  public readonly infiniteCacheID: string;
  public readonly value: InfiniteConduitPage<T, C>[];
  constructor({ value, infiniteCacheID }: IInfiniteConduitValue<T, C>) {
    this.value = value;
    this.infiniteCacheID = infiniteCacheID;
  }

  public setPage(value: InfiniteConduitPage<T, C>) {
    const { value: pages, infiniteCacheID } = this;
    const clone = [...pages];
    clone[value.index] = value;
    return new InfiniteConduitValue({
      value: clone,
      infiniteCacheID,
    });
  }

  public decompose() {
    return this.value.map(page => page.value);
  }
}
