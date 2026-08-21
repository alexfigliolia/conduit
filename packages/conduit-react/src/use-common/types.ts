export type IUseOptions<T extends Record<string, any>> = T & {
  skipWhen?: ISkipWhen;
};

export type ISkipWhen = boolean | (() => boolean);
