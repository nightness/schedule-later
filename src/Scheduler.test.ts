import { startTimeout, startInterval, TimeInMS } from './Scheduler'

describe('setTimeout Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('startTimeout, should start and stop properly', () => {
    const callback = jest.fn()

    const stop = startTimeout(callback, { ms: 5000 })

    // Advance timers by less than the delay and check if callback has not been called
    jest.advanceTimersByTime(2000)
    expect(callback).not.toBeCalled()

    // Advance timers to exactly the delay and check if callback has been called
    jest.advanceTimersByTime(3000)
    expect(callback).toBeCalled()

    // Cleanup
    stop()
  })

  test('startTimeout, should not call the function if stop function is called', () => {
    const fn = jest.fn()
    const stop = startTimeout(fn, { ms: TimeInMS.SECOND })

    expect(fn).not.toBeCalled()
    stop()
    jest.advanceTimersByTime(TimeInMS.SECOND)
    expect(fn).not.toBeCalled()
  })
})

describe('setInterval Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('startInterval, should correctly start and repeat interval', () => {
    const callback = jest.fn()

    const stop = startInterval(callback, 2000, { ms: 5000 })

    // Advance timers by less than the initial delay and check if callback has not been called
    jest.advanceTimersByTime(2000)
    expect(callback).not.toBeCalled()

    // Advance timers to exactly the delay and check if callback has been called
    jest.advanceTimersByTime(3000)
    expect(callback).toBeCalledTimes(1)

    // Advance timers by the interval and check if callback has been called again
    jest.advanceTimersByTime(2000)
    expect(callback).toBeCalledTimes(2)

    // Cleanup
    stop()
  })

  test('startInterval, should not call the function if stop function is called', () => {
    const fn = jest.fn()
    const stop = startInterval(fn, 2000, { ms: TimeInMS.SECOND })

    expect(fn).not.toBeCalled()
    stop()
    jest.advanceTimersByTime(TimeInMS.SECOND)
    expect(fn).not.toBeCalled()
  })
})
