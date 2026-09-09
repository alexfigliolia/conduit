import { InfiniteConduitValue } from "../../Conduits/InfiniteConduit/InfiniteConduitValue";
import { InfiniteConduitPage } from "../../Conduits/InfiniteConduit/InfiniteConduitPage";
import { type EvictReturnType } from "../../Conduits/BaseConduit/types";

import type { IInfiniteCache, UnknownCacheAbstract } from "./types";
import { InfiniteCacheIDs } from "./InfiniteCacheIDs";
import type { CacheEntry } from "./CacheEntry";

export class InfiniteCache<C extends UnknownCacheAbstract> {
  private readonly pageIDs: InfiniteCacheIDs;
  private readonly infiniteIDs: InfiniteCacheIDs;
  private readonly PageNodes = new Map<
    string,
    CacheEntry<InfiniteConduitPage<unknown, C>, EvictReturnType<C>>
  >();
  private readonly InfiniteNodes = new Map<
    string,
    CacheEntry<InfiniteConduitValue<unknown, C>, EvictReturnType<C>>
  >();
  constructor({ lastPageID, lastInfiniteID }: IInfiniteCache = {}) {
    this.pageIDs = new InfiniteCacheIDs(lastPageID);
    this.infiniteIDs = new InfiniteCacheIDs(lastInfiniteID);
  }

  public getInfiniteID() {
    return this.infiniteIDs.get();
  }

  public getPageID() {
    return this.pageIDs.get();
  }

  public get lastPageID() {
    return this.pageIDs.last();
  }

  public get lastInfiniteID() {
    return this.infiniteIDs.last();
  }

  public getInfiniteNode<T = unknown>(ID: string) {
    return this.InfiniteNodes.get(ID) as
      | CacheEntry<InfiniteConduitValue<T, C>, EvictReturnType<C>>
      | undefined;
  }

  public getPageNode<T = unknown>(ID: string) {
    return this.PageNodes.get(ID) as
      | CacheEntry<InfiniteConduitPage<T, C>, EvictReturnType<C>>
      | undefined;
  }

  public writePage(page: InfiniteConduitPage<any, C>) {
    const node = this.getInfiniteNode(page.infiniteCacheID);
    node?.setValue?.(prev => prev.setPage(page));
    return node?.State?.getState();
  }

  public registerInfiniteNode(
    cacheNode: CacheEntry<InfiniteConduitValue<any, C>, EvictReturnType<C>>,
  ) {
    this.InfiniteNodes.set(
      cacheNode.State.getState().infiniteCacheID,
      cacheNode,
    );
  }

  public registerPageNode(
    cacheNode: CacheEntry<InfiniteConduitPage<any, C>, EvictReturnType<C>>,
  ) {
    this.PageNodes.set(cacheNode.State.getState().pageID, cacheNode);
  }

  public deleteInfiniteNode(
    cacheNode:
      | string
      | CacheEntry<InfiniteConduitValue<any, C>, EvictReturnType<C>>,
  ) {
    this.InfiniteNodes.delete(
      typeof cacheNode === "string"
        ? cacheNode
        : cacheNode.State.getState().infiniteCacheID,
    );
  }

  public deletePageNode(
    cacheNode:
      | string
      | CacheEntry<InfiniteConduitPage<any, C>, EvictReturnType<C>>,
  ) {
    this.PageNodes.delete(
      typeof cacheNode === "string"
        ? cacheNode
        : cacheNode.State.getState().infiniteCacheID,
    );
  }

  public onEvict(entry: CacheEntry<any, any>) {
    const value = entry.State.getState();
    if (value instanceof InfiniteConduitValue) {
      return this.deleteInfiniteNode(entry);
    }
    if (value instanceof InfiniteConduitPage) {
      return this.deletePageNode(entry);
    }
  }

  public onReset() {
    this.pageIDs.reset();
    this.infiniteIDs.reset();
    this.PageNodes.clear();
    this.InfiniteNodes.clear();
  }
}
