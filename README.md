# Scheduler

Scheduler is a TypeScript class that provides methods for managing time-based tasks, such as starting and stopping timeouts and intervals at specific times.

## Key Concepts

### TimeOfDay

A `TimeOfDay` object is used to represent a specific time of day. It is an object containing the `hour`, `minute`, and `seconds`.

```typescript
export interface TimeOfDay {
  hour: number
  minute?: number
  seconds?: number
}
```

### TimeUntil

A `TimeUntil` object is used to represent a specific time until a certain event. It can represent time until a certain date, milliseconds from now, or a specific time of day.

```typescript
export type TimeUntil = {
  timeOfDay?: TimeOfDay
  date?: Date
  ms?: number
}
```

## Usage

The `Scheduler` class provides two main static methods: `startTimeout` and `startInterval`.

### startTimeout

The `startTimeout` method starts a timeout that calls a given function after a specific delay. The delay is calculated based on the `TimeUntil` object passed to it. The method returns a `StopFunction` (see below).

```typescript
public static startTimeout(
  timerFunc: Function,
  start: TimeUntil
): StopFunction;
```

### startInterval

The `startInterval` method starts an interval that calls a given function repeatedly with a fixed time delay between each call. Like `startTimeout`, the initial delay is calculated based on a `TimeUntil` object. The method returns a `StopFunction` (see below).

```typescript
public static startInterval(
  intervalFunc: Function,
  intervalMS: number,
  start?: TimeUntil
): StopFunction;
```

## Stop Functions

Both the `startTimeout` and `startInterval` methods return a `StopFunction`. This function can be called to cancel a timeout or interval.

When called with no arguments, the `StopFunction` stops the timeout or interval immediately. If called with a `TimeUntil` argument, it schedules a stop at the specified time.

Here is the type definition of a `StopFunction`:

```typescript
type StopFunction = (stopTime?: TimeUntil) => StopCancelFunction | null
```

## Stop Cancel Functions

The `StopFunction` returns a `StopCancelFunction` when called. This function can be called to cancel a scheduled stop.

```typescript
type StopCancelFunction = (stopRunning: boolean = false) => void
```

In the `StopCancelFunction`, if the `stopRunning` parameter is `true`, it stops the timeout or interval immediately. If `stopRunning` is `false`, it cancels the scheduled stop.

## Examples

1. Start a timeout that says "Hello, world!" after 10 seconds, then stop it after 5 seconds.

   ```typescript
   const sayHello = () => console.log('Hello, world!')

   // Start a timeout that says "Hello, world!" after 10 seconds, and stop it after 5 seconds.
   let stopTimeout = Scheduler.startTimeout(sayHello, { ms: 10000 })
   stopTimeout({ ms: 5000 })
   ```

2. Using startTimeout with a specific time of day

   ```typescript
   const goodMorning = () => console.log('Good morning!')
   let stopTimeout = Scheduler.startTimeout(goodMorning, {
     timeOfDay: { hour: 7, minute: 0 },
   })

   // Later, if you want to cancel the morning greeting
   stopTimeout()
   ```

   In this example, the goodMorning function will be called at 7:00 AM. If you want to cancel the morning greeting (for example, the user chose to sleep in), you can call the stopTimeout function.
   &nbsp;

3. Using startInterval with a specific interval, basically a regular setInterval

   ```typescript
   const sayHello = () => console.log('Hello, world!')
   let stopInterval = Scheduler.startInterval(sayHello, 1000)

   // Later, if you want to stop the interval
   stopInterval()
   ```

4. Using startInterval with a specific time of day

   ```typescript
   const sayHello = () => console.log('Hello, world!')
   let stopInterval = Scheduler.startInterval(sayHello, 1000, {
     timeOfDay: { hour: 7, minute: 0 },
   })

   // Later, if you want to stop the interval
   stopInterval()
   ```

   In this example, the sayHello function will be called every 1000 milliseconds starting at 7:00 AM. If you want to cancel the morning greeting (for example, the user chose to sleep in), you can call the stopInterval function.
