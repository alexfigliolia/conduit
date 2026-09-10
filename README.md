# Conduit

A framework agnostic state composition library for server-derived data.

This library was designed with two things in mind:

1. To ship a lighter-weight alternative to @tanstack/query with a smaller API footprint
2. To ship a more performant caching and reactivity model

#### Navigating the Docs:

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Reactivity](#reactivity)
4. [Network Conduits](#network-conduits)
5. [Infinite Conduits](#infinite-conduits)
6. [Infinite Network Conduits](#infinite-network-conduits)
7. [The Cache](#the-cache)
8. [Usage with React](#usage-with-react)
9. [Example Application](#example-application)

## Installation

```bash
npm i -S @figliolia/conduit @figliolia/event-emitter @figliolia/galena
```

## Basic Usage

Using Conduit, stateful operations are defined once then consumed anywhere they're needed:

```typescript
import { Conduit, Cache } from "@figliolia/conduit";

export const QueryCache = new Cache();

export const WeatherConduit = new Conduit({
  // A root level cache key
  key: ["weather-forecast"],
  // A cache instance you'd like to store your data in
  cache: QueryCache,
  // an optional cache lifetime
  expires: 60 * 1000 * 5,
  // an optional caching policy
  cachePolicy: "read-cache-with-respect-to-expiry",
  // an optional default value to resolve with when the cache is empty
  // or operations are in-flight
  defaultValue: [],
  // the operation associated with this conduit
  operation: async (latitude: number, longitude: number) => {
    const params = new URLSearchParams({ latitude, longitude });
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    );
    return response.json();
  },
});

export const TOKIO_POSITION = [35.6895, 139.6917] as const;
export const NYC_POSITION = [40.7128, 74.006] as const;

const weatherInTokio = await WeatherConduit.execute({
  args: TOKIO_POSITION,
});

const weatherInNYC = await WeatherConduit.execute({
  args: NYC_POSITION,
});
```

Your conduit will take care of

1. Routing duplicate requests to the cache
2. Providing stateful values for your web frameworks
3. Expiring stale values
4. Performing background refreshes

## Reactivity

With a basic conduit setup, getting a live-stream of stateful values is easy.

```typescript
import { WeatherConduit, TOKIO_POSITION } from "./MyWeatherConduit";

const subscriber = WeatherConduit.subscribeToValue({
  args: TOKIO_POSITION,
  onChange: forecast => {
    // Render your UI with tokio weather data
  },
});

// unsubscribe
subscriber();
```

You can also subscribe to its internal operation status

```typescript
import { WeatherConduit, TOKIO_POSITION } from "./MyWeatherConduit";

const subscriber = WeatherConduit.subscribeToStatus({
  args: TOKIO_POSITION,
  onChange: status => {
    // Render loading or completed
  },
});

// unsubscribe
subscriber();
```

You can also subscribe to both value and operation status at the same time

```typescript
import { WeatherConduit, TOKIO_POSITION } from "./MyWeatherConduit";

const subscriber = WeatherConduit.subscribe({
  args: TOKIO_POSITION,
  onChange: ({ value, status }) => {
    // Render UI with value and status
  },
});

// unsubscribe
subscriber();
```

### Mutation & Eviction

To mutate data in your cache

```typescript
import { WeatherConduit, TOKIO_POSITION } from "./MyWeatherConduit";

// write a new value to the cache
const forecast = await WeatherConduit.writeCache({
  args: TOKIO_POSITION,
  value: /* your weather forecast */
});

// or compute the new value using the previous value
const forecast = await WeatherConduit.writeCache({
  args: TOKIO_POSITION,
  value: (previous) => [...previous, /* your weather forecast */]
});
```

If there's a time where it's pertinent to evict cache entries, you can do so with your conduit's `evict()` method

```typescript
import { WeatherConduit, TOKIO_POSITION } from "./MyWeatherConduit";

const forecast = await WeatherConduit.execute({
  args: TOKIO_POSITION,
});

// evict the tokio weather forecast
WeatherConduit.evict(...TOKIO_POSITION);
```

## Network Conduits

The default Conduit class will not capture errors thrown if an operation fails. If your operation requires stateful errors as well as stateful values, opt for the `NetworkConduit`

Declaration and usage is identical to that of a `Conduit` with the exception that the underlying value now holds your data as well as any errors thrown

```typescript
import { NetworkConduit, Cache } from "@figliolia/conduit";

export const QueryCache = new Cache();

export const WeatherConduit = new NetworkConduit({
  // Your configuration from the previous example
});

const subscriber = WeatherConduit.subscribe({
  args: [35.6895, 139.6917],
  onChange: ({ value, status }) => {
    // value.data now holds any resolved data
    // value.error holds any errors thrown during an operation
  },
});
```

## Infinite Conduits

If your app has pagination related needs, the `InfiniteConduit` will help manage the data between operation calls within a single construct.

```typescript
import { addDays } from "date-fns";
import { InfiniteConduit, Cache } from "@figliolia/conduit";

export const QueryCache = new Cache();

export const WeatherConduit = new InfiniteConduit({
    cache: QueryCache,
    key: ['infinite-weather-forecast'],
    // paginate using the date of the forecast data
    paginationArgs: ['date']
    operation: async (
      position: { latitude: number, longitude: number, date: Date }
    ) => {
      const params = new URLSearchParams({...position, date: position.date.toISOString() });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      return response.json();
    }
});

const todaysWeather = await WeatherConduit.execute({ args: {
    latitude: 35.6895,
    longitude: 139.6917,
    date: new Date(),
}});

const tomorrowsWeather = await WeatherConduit.execute({ args: {
    latitude: 35.6895,
    longitude: 139.6917,
    date: addDays(new Date(), 1),
}});

const paginatedWeather = WeatherConduit.readCache({
    latitude: 35.6895,
    longitude: 139.6917,
    date: new Date(),
});
// [todaysWeather, tomorrowsWeather]
```

With `InfiniteConduits` the subscription models remain the same as with prior examples - with the added option to subscribe, update, or evict individual pages or the paginated dataset:

```typescript
InfiniteConduit.getCacheEntry(/* operation args */);
InfiniteConduit.readCache(/* operation args */);
InfiniteConduit.readPageCache(/* operation args */);
InfiniteConduit.getStatus(/* operation args */);
InfiniteConduit.getPageStatus(/* operation args */);
InfiniteConduit.subscribeToValue(/* operation args */);
InfiniteConduit.subscribeToPageValue(/* operation args */);
InfiniteConduit.subscribeToStatus(/* operation args */);
InfiniteConduit.subscribeToPageStatus(/* operation args */);
InfiniteConduit.writeCache(/* operation args */);
InfiniteConduit.evict(/* operation args */);
InfiniteConduit.evictPage(/* operation args */);
InfiniteConduit.evictAll(/* operation args */);
```

`InfiniteConduit` operations are limited to **one** function parameter of object type. This is designed to allow for `paginationArgs` to be strictly typed against that object type.

## Infinite Network Conduits

Naturally, you may want the same error handling you get with `NetworkConduits` for your `InfiniteConduits`.

To enable that behavior declare your Conduit using `new InfiniteNetworkConduit()`

Each page's data will now track the stateful values and/or errors that occur from your Conduit's operation.

```typescript
import { InfiniteNetworkConduit, Cache } from "@figliolia/conduit";

export const QueryCache = new Cache();

export const WeatherConduit = new InfiniteNetworkConduit({
    cache: QueryCache,
    key: ['infinite-weather-forecast'],
    // paginate using the date of the forecast data
    paginationArgs: ['date']
    operation: async (
        position: { latitude: number, longitude: number, date: Date }
    ) => {
      const params = new URLSearchParams({...position, date: position.date.toISOString() });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      return response.json();
    }
});

const todaysWeather = await WeatherConduit.execute({ args: {
    latitude: 35.6895,
    longitude: 139.6917,
    date: new Date(),
}});
/* {
  data: T | null,
  error: unknown
} */
```

## The Cache

The Conduit `Cache` is your data storage and reactivity provider. You will likely never need to interact with the cache directly - as each of your Conduits provide methods for accessing and subscribing to cached data.

However it may be prudent to pre-populate the `Cache` using server-side data if using Conduits in server-rendered applications. To do so, simply serialize your cache data on the server and append it to your request responses:

```typescript
// On the server
import { Cache } from "@figliolia/conduit";
import { renderApp } from "your-web-framework/server";

app.get('*', (req, res) => {
  const cache = new Cache();
  // populate the cache by rendering the app serverside
  renderApp(req, (result) => {
    result.body.appendChild(
      <script>
        // serialize the cache data and attach it to the response
        window.__CONDUIT_CACHE__ = cache.serialize()
      </script>
    )
    res.send(result);
  });
});

// on the client initialize the cache with serverside data
const ConduitCache = new Cache({ data: window.__CONDUIT_CACHE__ });
```

Using this technique your Conduit cache will be populated with the results of each operation that took place on the server.

### The Cache Structure

Your serialized cache data may look unusual if inspecting it via `console.log()`. This is because the underlying storage structure of the cache is a [Graph](<https://en.wikipedia.org/wiki/Graph_(abstract_data_type)>). The graph is an optimization technique for caching conduit operation results without having to `stringify` keys and arguments. It improves the speed of cache interactions by roughly `5x`.

When inserting a conduit operation result into the cache, the conduit's key, operation arguments, and result are traversed into a deterministic set of JavaScript primitives - used to create edges between graph nodes.

Each of your conduit cache entries sit in the graph at the very bottom of each path these edges create.

This storages structure uses serialization that is more robust than `JSON.stringify()`. With it, you can pass `Maps`, `Sets`, `Regexes`, `Dates`, `BigInts` (and more) over the wire using your conduit cache.

These complex types - normally not supported in standard JSON - are decomposed into JSON-valid primitives and reconstructed when building your cache from serialized data.

If there is a JavaScript type you'd like to see supported, that currently isn't, please [file and issue here](https://github.com/alexfigliolia/conduit/issues) or checkout [Creating your own Serializers](#creating-your-own-serializers).

To visualize the storage structure you can clone this repository and run:

```bash
pnpm i && pnpm setup:repo && repokit core visualize
```

### Creating your own Serializers

If using complex types or custom classes in your conduit cache it may be pertinent to understand how to rebuild their prototypes after they've been converted to JSON. Conduit makes this easy by exposing an `AbstractSerializer`. The `AbstractSerializer` is how the cache supports de/re-composing maps, sets, dates, and more after cache data has been serialized.

To create a serializer for your custom type, you can extend the `AbstractSerializer` and pass it into your `Cache's` options.

As a working example, let's consider the following custom type returned by a conduit

```typescript
export class APIResponse<T, E = unknown> {
  public readonly statusCode: number;
  public readonly responseData?: T;
  public readonly error: E | null = null;
  constructor({ statusCode, responseData, error = null }) {
    this.error = error;
    this.statusCode = statusCode;
    this.responseData = responseData;
  }

  public deriveValue() {
    if (!!this.error && !this.responseData) {
      return this.error;
    }
    return this.responseData;
  }
}
```

If you were to serialize this value to JSON for the purposes or storage or transfer via API the `APIResponse.deriveValue()` would get lost. Any code relying on this prototypal method would also break if it were to not be there when constructing a cache from serialized data.

Here's how you can teach the Conduit `Cache` how to deconstruct and recompose your custom types:

```typescript
import {
  Cache,
  AbstractSerializer,
  type OnPrimitive,
  type IInterativeSerializer
  type ConduitSerializedValue
} from "@figliolia/contuit";
import { APIResponse } from "./my-custom-api-response";

export class APIResponseSerializer extends AbstractSerializer<
  APIResponse<any, any>
  { statusCode: number, responseData: unknown, error: null | unknown }
> {
    constructor(config: IInterativeSerializer) {
    super("API RESPONSE SERIALIZER", config);
  }

  // Override `matchPreserializationInput` so it can identify your objects
  public override matchPreserializationInput(input: unknown) {
    return input instanceof APIResponse;
  }

  // Override `deserialize` to reconstruct your custom types from serialized
  // inputs
  public override deserialize(
    value: ConduitSerializedValue<{
      statusCode: number, responseData: unknown, error: null | unknown
    }>
  ) {
    const config = this.config.deserialize(value.value);
    // run any validations you wish after deserializing
    if (typeof config.statusCode !== "number") {
      this.sanitationError(config);
    }
    // use the config to re-construct an APIResponse instance
    return new APIResponse(config);
  }

  // Override `serializeValue` to turn an input into deterministic
  // serializeable data
  protected override serializeValue(input: APIResponse<any, any>) {
    return this.config.serialize(input);
  }

  // Override toPath - this method is used to generate cache node
  // paths in the storage graph.
  public override toPath(
    value: APIResponse<any, any>,
    onPrimitive: OnPrimitive,
  ): boolean {
    // you can use Conduit's default object path traveral which will
    // deconstruct any object's key/value pairs into a graph node path
    return this.defaultPathSerializer(value, onPrimitive);

    // Or you can create an optimized version of your own based
    // on the identity properties of you input

    // Create an initial path edge from your serializer's key
    onPrimitive(this.KEY_INDICATOR);
    // traverse deterministic only the properties pertinent to your type's
    // cache identity
    const requiredProperties = ["statusCode", "responseData", "error"];
    for(const property in requiredProperties) {
      // invoke onPrimitive for each JavaScript primitive and
      // `this.config.traverse` for non JavaScript primitivese
      if(
        !onPrimitive(property) ||
        !this.config.traverse(value[property], onPrimitive)
      ) {
        // break early if a call returns false
        return false;
      }
    }
    // call onPrimitive once more with your serializer's key to
    // close your path
    return onPrimitive(this.KEY_INDICATOR);
  }
}
```

Finally pass your serializer to your conduit cache

```typescript
import { Cache } from "@figliolia/conduit";
import { APIResponseSerializer } from "./my-api-response-serializer";

export const cache = new Cache({
  serializers: [APIResponseSerializer],
});
```

Now any usage of your `APIResponse` class can be serialized to JSON and its prototype reconstructed when calling

```typescript
const serverData = serverCache.serialize();

const clientCache = new Cache({
  data: serverData,
  serializers: [APIResponseSerializer],
});
```

### Using Custom Caches

Conduits are designed to accept custom caches for storing Conduit data. The default cache is a reactive graph data store that benchmarks at `~4-5x` more performant than flat JavaScript objects and uses less memory on average.

Understanding that this structure may not always be the most optimal schema, this library exposes the `CacheAbstract`. It allows developers to build a cache optimized for their data and use it with their conduits.

To build and use your own cache, simply extend the `CacheAbstract`:

```typescript
import {
  CacheAbstract,
  type CacheOptions,
  CacheEntry,
} from "@figliolia/conduit";

export class MyCustomCache extends CacheAbstract<MySchema, MySerializedSchema> {
  public storage: MySchema;
  constructor(options: CacheOptions<MySerializedSchema> = {}) {
    super(options);
    this.storage = this.createMyStorage(options?.data?.data);
  }

  createMyStorage(initialData?: MySerializedSchema): MySchema {
    // build and return your custom data structure
  }

  public override serialize(): SerializedStorage<MySerializedSchema> {
    // implement your cache serialization
    return {
      ...super.lastInfiniteIDs,
      data: {/* your custom serializer */},
    };
  }

  public override set<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    value: T | (() => T),
  ): CacheEntry<T, any> | undefined {
    // implement your mechanism for storing cached data based on
    // conduit keys and operation args
  }

  public override get<T>(
    key: any[],
    args: any[],
  ): CacheEntry<T, any> | undefined {
    // implement your mechanism for retrieving cached entries based on
    // conduit keys and operation args
  }

  public override reset() {
    // implement your mechanism for clearing the cache
    super.resetInfiniteCache();
  }

  public override evict(key: any[], args: any[]) {
    // implement your mechanism for evicting cache entries
  }

  public override createEntryIfNotExists<T extends NonFunction<any>>(
    key: any[],
    args: any[],
    defaultValue: T | (() => T),
  ): CacheEntry<T, any> {
    // Implement your mechanism for creating cache entries if
    // not already existent
  }
}
```

Lastly pass an instance of your cache to your conduits

```typescript
import { Conduit } from "@figliolia/conduit";
import { MyCustomCache } from "./my-custom-cache";

const cache = new MyCustomCache();

const myConduit = new Conduit({
  cache,
  // ... other arguments
});
```

Now your conduits will use your own custom cache as the underlying data store.

## Usage with React

To use your conduits as stateful operations in your React Applications, head over to the [Conduit React Docs](https://github.com/alexfigliolia/conduit/blob/main/packages/conduit-react/README.md)

If you wish to see support for a specific web-framework, please [file and issue here](https://github.com/alexfigliolia/conduit/issues).

## Example Application

To see Conduit in a simple react application you can head over to [the example app](https://github.com/alexfigliolia/conduit/blob/main/packages/conduit-example).

To run the app, you can clone this repository and run:

```bash
pnpm i && pnpm setup:repo && repokit example dev
```
