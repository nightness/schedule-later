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
type StopCancelFunction = (stopRunning: boolean) => void
type StopFunction = (stopTime?: TimeUntil) => StopCancelFunction | null

export default class Scheduler {
  private static timeUntil(start: TimeUntil) {
    if (start.ms) {
      return start.ms
    }

    // get the current date
    let now = new Date()

    // set the target time
    let targetTime = !start.timeOfDay
      ? start.date
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          start.timeOfDay.hour,
          start.timeOfDay.minute ?? 0,
          start.timeOfDay.seconds ?? 0,
          0
        )

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
  public static startTimeout(
    timerFunc: Function,
    start: TimeUntil
  ): StopFunction {
    let delay = this.timeUntil(start)

    // set a timeout to start the interval at the target time
    let timeout: NodeJS.Timeout = null
    timeout = setTimeout(function () {
      // Clear the timeout variable
      timeout = null
      // call the function immediately
      timerFunc()
    }, delay)

    const stopNow = () => {
      if (timeout) clearTimeout(timeout)
    }

    // stop() function to stop the interval and timeout
    // stop(stopInMS) will stop the interval and timeout in stopInMS milliseconds
    // stop(stopHour, stopMinute) will stop the interval and timeout at the next stopHour:stopMinute
    const stop = (stopTime?: TimeUntil): StopCancelFunction => {
      if (stopTime === undefined) {
        stopNow()
        return null
      }

      if ((stopTime as any) instanceof Date) {
        // @ts-ignore - TS doesn't know this is allowed
        const timeFromNow = stopTime - new Date()
        const stopTimeout = setTimeout(stopNow, timeFromNow)
        // stopRunning is a boolean that will either cancel the stop (false), or stop the interval now (true)
        return (stopRunning: boolean = false) => {
          clearTimeout(stopTimeout)
          if (stopRunning) stopNow()
        }
      }

      const stopTimeout = setTimeout(stopNow, this.timeUntil(stopTime))
      // stopRunning is a boolean that will either cancel the stop (false), or stop the interval now (true)
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
   * @param {TimeUntil} start
   * @return {StopFunction}
   */
  public static startInterval(
    intervalFunc: Function,
    intervalMS: number,
    start?: TimeUntil
  ): StopFunction {
    let delay = this.timeUntil(start)

    // set a timeout to start the interval at the target time
    let interval: number = null
    let timeout = setTimeout(function () {
      // Clear the timeout variable
      timeout = null
      // start the interval
      interval = setInterval(intervalFunc, intervalMS)
      // call the function immediately
      intervalFunc()
    }, delay)

    const stopNow = () => {
      if (timeout) clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }

    // stop() function to stop the interval and timeout
    // stop(stopInMS) will stop the interval and timeout in stopInMS milliseconds
    // stop(stopHour, stopMinute) will stop the interval and timeout at the next stopHour:stopMinute
    const stop = (stopTime?: TimeUntil): StopCancelFunction => {
      if (stopTime === undefined) {
        stopNow()
        return null
      }

      if ((stopTime as any) instanceof Date) {
        // @ts-ignore - TS doesn't know this is allowed
        const timeFromNow = stopTime - new Date()
        const stopTimeout = setTimeout(stopNow, timeFromNow)
        // stopRunning is a boolean that will either cancel the stop (false), or stop the interval now (true)
        return (stopRunning: boolean = false) => {
          clearTimeout(stopTimeout)
          if (stopRunning) stopNow()
        }
      }

      const stopTimeout = setTimeout(stopNow, this.timeUntil(stopTime))
      // stopRunning is a boolean that will either cancel the stop (false), or stop the interval now (true)
      return (stopRunning: boolean = false) => {
        clearTimeout(stopTimeout)
        if (stopRunning) stopNow()
      }
    }

    // return a cleanup function
    return stop
  }
}
