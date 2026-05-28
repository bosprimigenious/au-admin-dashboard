import { createPinia, defineStore, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MonitoringPage from '../../views/MonitoringPage.vue'

vi.mock('../../store/monitoringStore', () => ({
  useMonitoringStore: defineStore('monitoring', () => {
    const loading = ref(false)
    const series = ref([])
    const alerts = ref([])
    const dataSource = ref('otel')
    const error = ref('')
    const p95LatencyMs = ref(123)
    const recentCalls = ref([])
    const resourceSnapshot = ref(null)
    const topCallers = ref([])
    const totalCalls = ref(12)
    const totalTokens = ref(345)
    const fetchMetrics = vi.fn().mockResolvedValue(undefined)
    const setAutoRefresh = vi.fn()

    return {
      loading,
      series,
      alerts,
      dataSource,
      error,
      p95LatencyMs,
      recentCalls,
      resourceSnapshot,
      topCallers,
      totalCalls,
      totalTokens,
      fetchMetrics,
      setAutoRefresh,
    }
  }),
}))

describe('MonitoringPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
  })

  it('shows alert notification settings and persists them locally', async () => {
    const wrapper = mount(MonitoringPage)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Alert Notifications')

    await wrapper.get('input[placeholder="https://example.com/webhook"]').setValue('https://hooks.example.com')
    await wrapper.get('input[placeholder="alerts@example.com"]').setValue('alerts@example.com')
    const saveButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Save Notification Settings'))
    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')

    const stored = JSON.parse(window.localStorage.getItem('au-monitoring-notification-config') ?? '{}')
    expect(stored.webhookUrl).toBe('https://hooks.example.com')
    expect(stored.email).toBe('alerts@example.com')
  })
})
