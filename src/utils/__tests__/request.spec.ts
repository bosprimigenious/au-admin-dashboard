import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { httpGet, request } from '../request'

const mock = new MockAdapter(request)

afterEach(() => {
  mock.reset()
  vi.restoreAllMocks()
})

describe('request interceptors', () => {
  it('500 错误时触发统一 HTTP 错误事件', async () => {
    mock.onGet('/boom').reply(500, { message: 'server error' })

    const listener = vi.fn()
    window.addEventListener('app:http-error', listener)

    await expect(httpGet('/boom')).rejects.toBeTruthy()

    expect(listener).toHaveBeenCalledTimes(1)
    const event = listener.mock.calls[0][0] as CustomEvent<{ status: number; message: string }>
    expect(event.detail.status).toBe(500)

    window.removeEventListener('app:http-error', listener)
  })

  it('无状态网络错误时也触发统一 HTTP 错误事件', async () => {
    mock.onGet('/offline').networkError()

    const listener = vi.fn()
    window.addEventListener('app:http-error', listener)

    await expect(httpGet('/offline')).rejects.toBeTruthy()

    expect(listener).toHaveBeenCalledTimes(1)
    const event = listener.mock.calls[0][0] as CustomEvent<{ status: number; message: string }>
    expect(event.detail.status).toBe(0)

    window.removeEventListener('app:http-error', listener)
  })
})
