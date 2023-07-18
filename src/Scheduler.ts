export enum TimeInMS {
  SECOND = 1000,
  MINUTE = 60000,
  HALF_HOUR = 1800000,
  HOUR = 3600000,
  HALF_DAY = 43200000,
  DAY = 86400000,
  WEEK = 604800000,
  FOUR_SCORE = 1209600000, // 14 days
  MONTH = 2592000000,
}

export interface TimeOfDay {
  hour: number
  minute?: number
  seconds?: number
}

export type TimeUntil = {
  timeOfDay?: TimeOfDay
  date?: Date
  ms?: number
}

export type StopCancelFunction = (stopRunning?: boolean) => void

export type StopFunction = (stopTime?: TimeUntil) => StopCancelFunction | null

/**
 * Used to convert a TimeUntil object into a number of milliseconds
 * @param {TimeUntil} start
 * @return {number} delay
 */
function timeUntil(start: TimeUntil): number {
  if (start.ms) {
    return start.ms
  }

  // get the current date
  let now = new Date()

  // set the target time
  const targetTime = start.timeOfDay
    ? new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        start.timeOfDay.hour,
        start.timeOfDay.minute ?? 0,
        start.timeOfDay.seconds ?? 0,
        0
      )
    : start.date ?? now

  // if the target time has already passed today, set it for tomorrow
  if (start.timeOfDay && now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1)
  }

  // calculate the delay until the next target time
  // @ts-ignore - TS doesn't know this is allowed
  let delay = targetTime - now

  return delay
}

/**
 * Start a timeout
 * @param {Function} timerFunc
 * @param {TimeUntil} start
 * @return {StopFunction}
 */
export function startTimeout(
  timerFunc: Function,
  start: TimeUntil
): StopFunction {
  let delay = timeUntil(start)

  // set a timeout to start the interval at the target time
  let timeout: NodeJS.Timeout | null = null
  timeout = setTimeout(function () {
    // Clear the timeout variable
    timeout = null

    // call the function immediately
    timerFunc()
  }, delay)

  /**
   * Cleanup function
   * @return {void}
   */
  const stopNow = () => {
    if (timeout) clearTimeout(timeout)
  }

  /**
   * Stops a timeout
   * @param {TimeUntil} stopTime - optional
   * @return {StopCancelFunction}
   */
  const stop = (stopTime?: TimeUntil): StopCancelFunction | null => {
    if (!stopTime) {
      stopNow()
      return null
    }

    // Set a timeout to stop the timeout at the target time
    const stopTimeout = setTimeout(stopNow, timeUntil(stopTime))

    /**
     * Cancels a delayed stop
     * @param {boolean} stopRunning - optional
     * @return void
     */
    return (stopRunning: boolean = false) => {
      clearTimeout(stopTimeout)
      if (stopRunning) stopNow()
    }
  }

  // return a cleanup function
  return stop
}

/**
 * Start an interval
 * @param {Function} intervalFunc
 * @param {number} intervalMS
 * @param {TimeUntil} start - optional
 * @param {boolean} callbackAfterTimeout - optional
 * @return {StopFunction}
 */
export function startInterval(
  intervalFunc: Function,
  intervalMS: number,
  start?: TimeUntil,
  callbackAfterTimeout: boolean = false
): StopFunction {
  let delay = start ? timeUntil(start) : 0

  // set a timeout to start the interval at the target time
  let interval: number | null =
    delay === 0 ? setInterval(intervalFunc, intervalMS) : null
  let timeout: NodeJS.Timeout | null =
    delay > 0
      ? setTimeout(function () {
          // Clear the timeout variable
          timeout = null

          // start the interval
          interval = setInterval(intervalFunc, intervalMS)

          // Invoke the callback, just because the timer expired (so at the beginning of the interval)
          if (callbackAfterTimeout) {
            intervalFunc()
          }
        }, delay)
      : null

  /**
   * Cleanup function
   * @return {void}
   */
  const stopNow = () => {
    if (timeout) clearTimeout(timeout)
    if (interval) clearInterval(interval)
  }

  /**
   * Stops an interval
   * @param {TimeUntil} stopTime - optional
   * @return {StopCancelFunction}
   */
  const stop = (stopTime?: TimeUntil): StopCancelFunction | null => {
    if (stopTime === undefined) {
      stopNow()
      return null
    }

    const stopTimeout = setTimeout(stopNow, timeUntil(stopTime))

    /**
     * Cancels a delayed stop
     * @param {boolean} stopRunning - optional
     * @return void
     */
    return (stopRunning: boolean = false) => {
      clearTimeout(stopTimeout)
      if (stopRunning) stopNow()
    }
  }

  // return a cleanup function
  return stop
}
