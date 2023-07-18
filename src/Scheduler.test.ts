// @ts-ignore - TS doesn't know this is allowed
import { startTimeout, startInterval, TimeInMS } from './Scheduler'

beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.clearAllTimers()
})

describe('startTimeout Tests', () => {
  test('should start and stop properly', () => {
    const callback = jest.fn()
    const stop = startTimeout(callback, { ms: 5000 })

    // Advance timers by less than the delay and check if callback has not been called
    jest.advanceTimersByTime(TimeInMS.SECOND * 2)
    expect(callback).not.toBeCalled()

    // Advance timers to exactly the delay and check if callback has been called
    jest.advanceTimersByTime(3000)
    expect(callback).toBeCalled()

    // Cleanup
    stop()
  })

  test('should not call immediately', () => {
    const callback = jest.fn()
    const stop = startTimeout(callback, { ms: 5000 })

    // Should not be called immediately
    expect(callback).not.toBeCalled()

    // Cleanup
    stop()
  })

  test('should not call the function if stop function is called', () => {
    const callback = jest.fn()
    const stop = startTimeout(callback, { ms: TimeInMS.SECOND })

    // Stop the timeout
    stop()

    // Advance timers by less than the delay and check if callback has not been called
    jest.advanceTimersByTime(TimeInMS.SECOND)
    expect(callback).not.toBeCalled()

    // Advance timers by less than the delay and check if callback has not been called
    jest.advanceTimersByTime(TimeInMS.SECOND)
    expect(callback).not.toBeCalled()
  })

  test('should still call the function if stop function is called with a delay then canceled', () => {
    const callback = jest.fn()
    const stop = startTimeout(callback, { ms: TimeInMS.SECOND * 5 })

    // Cancel the timeout, in 5 seconds
    const stopCancel = stop({
      ms: TimeInMS.SECOND * 5,
    })!

    // Abort that cancel
    stopCancel()

    // Finish timer
    jest.advanceTimersByTime(TimeInMS.SECOND * 5)
    expect(callback).toBeCalled()
  })
})

describe('startInterval Tests', () => {
  test('should correctly start and repeat interval', () => {
    const callback = jest.fn()
    const stop = startInterval(callback, TimeInMS.SECOND * 2, { ms: 5000 })

    // Doesn't call the function right away
    expect(callback).not.toBeCalled()

    // Advance timers by less than the initial delay and check if callback has not been called
    jest.advanceTimersByTime(TimeInMS.SECOND * 2)
    expect(callback).not.toBeCalled()

    // Advance timers to exactly the delay and check if callback has been called
    jest.advanceTimersByTime(3000)
    expect(callback).toBeCalledTimes(1)

    // Advance timers by the interval and check if callback has been called again
    jest.advanceTimersByTime(TimeInMS.SECOND * 2)
    expect(callback).toBeCalledTimes(2)

    // Cleanup
    stop()
  })

  test('should not call the function if stop function is called', () => {
    const callback = jest.fn()
    const stop = startInterval(callback, TimeInMS.SECOND * 2, {
      ms: TimeInMS.SECOND,
    })

    expect(callback).not.toBeCalled()

    stop()

    jest.advanceTimersByTime(TimeInMS.SECOND)
    expect(callback).not.toBeCalled()
  })

  test('should still call the function if the stop function is called (with a delay), and the stopCancel function is called before the delay expires', () => {
    const callback = jest.fn()
    const stop = startInterval(callback, TimeInMS.SECOND * 2)

    jest.advanceTimersByTime(TimeInMS.SECOND * 2)
    expect(callback).toBeCalled()

    const stopCancel = stop({
      ms: TimeInMS.SECOND * 5,
    })
    stopCancel?.()

    jest.advanceTimersByTime(TimeInMS.SECOND * 2)
    expect(callback).toBeCalledTimes(2)

    // cleanup
    stop()
  })
})
