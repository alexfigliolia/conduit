import type { UnknownCacheAbstract } from "../../Cache";

import type { IInfiniteConduitPage, PageType } from "./types";

export class InfiniteConduitPage<T, C extends UnknownCacheAbstract> {
  public readonly index: number;
  public readonly pageID: string;
  public readonly value: PageType<T>;
  public readonly infiniteCacheID: string;
  constructor({
    cache,
    index,
    value,
    write,
    pageID,
    infiniteCacheID,
  }: IInfiniteConduitPage<T, C>) {
    this.index = index;
    this.value = value;
    this.pageID = pageID;
    this.infiniteCacheID = infiniteCacheID;
    if (write) {
      cache.InfiniteCache.writePage(this);
    }
  }

  public static new<T, C extends UnknownCacheAbstract>(
    data: IInfiniteConduitPage<T, C>,
  ) {
    return new InfiniteConduitPage<T, C>(data);
  }

  public write(value: PageType<T>, cache: C) {
    const { index, pageID, infiniteCacheID } = this;
    return new InfiniteConduitPage<T, C>({
      index,
      value,
      cache,
      pageID,
      write: true,
      infiniteCacheID,
    });
  }
}
