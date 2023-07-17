import Scheduler from './Scheduler'

describe('Scheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  test('startTimeout should correctly start and stop timeout', () => {
    const callback = jest.fn()

    const stop = Scheduler.startTimeout(callback, { ms: 5000 })

    // Advance timers by less than the delay and check if callback has not been called
    jest.advanceTimersByTime(2000)
    expect(callback).not.toBeCalled()

    // Advance timers to exactly the delay and check if callback has been called
    jest.advanceTimersByTime(3000)
    expect(callback).toBeCalled()

    // Cleanup
    stop()
  })

  test('startInterval should correctly start and stop interval', () => {
    const callback = jest.fn()

    const stop = Scheduler.startInterval(callback, 2000, { ms: 5000 })

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
})
