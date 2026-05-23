import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '../../api/admin'
import { useMonitoringStore } from '../monitoringStore'

describe('monitoringStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('loads llm metrics into store state', async () => {
    vi.spyOn(adminApi, 'getLlmMetrics').mockResolvedValue({
      series: [{ ts: '2026-04-01', calls: 3, tokens: 120 }],
      total_calls: 3,
      total_tokens: 120,
      alerts: [{ level: 'info', message: 'ok' }],
    })

    const store = useMonitoringStore()
    await store.fetchMetrics()

    expect(store.totalCalls).toBe(3)
    expect(store.totalTokens).toBe(120)
    expect(store.alerts).toHaveLength(1)
  })

  it('stores fetch errors', async () => {
    vi.spyOn(adminApi, 'getLlmMetrics').mockRejectedValue(new Error('metrics unavailable'))

    const store = useMonitoringStore()
    await store.fetchMetrics()

    expect(store.error).toBe('metrics unavailable')
    expect(store.metrics).toBeNull()
  })
})
