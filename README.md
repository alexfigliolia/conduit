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
  // the operation associated with this conduit
  operation: async (latitude: number, longitude: number) => {
    const response = await fetch("https://api.open-meteo.com/v1/forecast", {
      method: "POST",
      body: JSON.stringify({ latitude, longitude }),
    });
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

Let's say you want to know the status of you conduit's operation. You can also subscribe to its internal operation state

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

You can also subscribe to both at once

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

## Network Conduits

The default Conduit class will not capture errors thrown if an operation fails. If your operation requires stateful errors as well as stateful values, opt for the `NetworkConduit`

Declaration and usage is identical to that of a `Conduit` with the exception that the underlying value now can hold your data as well as any errors thrown

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
        const response = await fetch("https://api.open-meteo.com/v1/forecast", {
            method: 'POST',
            body: JSON.stringify({ latitude, longitude, date })
        });
        return response.json()
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

With `InfiniteConduits` the subscription models remain the same as with prior examples - with the added option to subscribe to individual pages or the entire paginated dataset:

```typescript
InfiniteConduit.readCache(/* operation args */);
InfiniteConduit.readPageCache(/* operation args */);
InfiniteConduit.getStatus(/* operation args */);
InfiniteConduit.getPageStatus(/* operation args */);
InfiniteConduit.subscribeToValue(/* operation args */);
InfiniteConduit.subscribeToPageValue(/* operation args */);
InfiniteConduit.subscribeToStatus(/* operation args */);
InfiniteConduit.subscribeToPageStatus(/* operation args */);
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
        const response = await fetch("https://api.open-meteo.com/v1/forecast", {
            method: 'POST',
            body: JSON.stringify({ latitude, longitude, date })
        });
        return response.json()
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
const ConduitCache = new Cache(window.__CONDUIT_CACHE__); 
```
Using this technique your Conduit cache will be populated with the results of each operation that took place on the server.

### The Cache Structure

Your serialized cache data may look unusual if inspecting it via `console.log()`. This is because the underlying storage structure of the cache is a [Graph](https://en.wikipedia.org/wiki/Graph_(abstract_data_type)). The graph is an optimization technique for caching conduit operation results without having to `stringify` keys and arguments. It improves the speed of cache interactions by roughly `5x`.

When inserting a conduit operation result into the cache, the conduit's key, operation arguments, and result are traversed into a deterministic set of JavaScript primitives - used to create edges between graph nodes.

Each of your conduit cache entries sit in the graph at the very bottom of each path these edges create.

This storages structure uses serialization that is more robust than `JSON.stringify()`. With it, you can pass `Maps`, `Sets`, `Regexes`, `Dates`, `BigInts` (and more) over the wire using your conduit cache. 

These complex types - normally not supported in standard JSON - are decomposed into JSON-valid primitives and reconstructed when building your cache from serialized data.

If there is a JavaScript type you'd like to see supported, that currently isn't, please [file and issue here](https://github.com/alexfigliolia/conduit/issues).

To visualize the storage structure you can clone this repository and run:

```bash
pnpm i && pnpm setup:repo && repokit core visualize
```

## Usage with React

To use your conduits as stateful operations in your React Applications, head over to the [Conduit React Docs](https://github.com/alexfigliolia/conduit/blob/main/packages/conduit-react/README.md)

If you wish to see support for a specific web-framework, please [file and issue here](https://github.com/alexfigliolia/conduit/issues).

## Example Application

To see Conduit in a simple react application you can head over to [the example app](https://github.com/alexfigliolia/conduit/blob/main/packages/conduit-example).

To run the app, you can clone this repository and run:
```bash
pnpm i && pnpm setup:repo && repokit example vite:install && repokit example dev
```
