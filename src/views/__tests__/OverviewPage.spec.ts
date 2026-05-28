import { createPinia, defineStore, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '../../api/admin'
import OverviewPage from '../../views/OverviewPage.vue'
import { useMonitoringStore } from '../../store/monitoringStore'

vi.mock('../../store/monitoringStore', () => ({
  useMonitoringStore: defineStore('monitoring', () => {
    const loading = ref(false)
    const recentCalls = ref([])
    const series = ref([])
    const fetchMetrics = vi.fn().mockResolvedValue(undefined)
    const fetchLlmMetrics = vi.fn().mockResolvedValue(undefined)
    const setAutoRefresh = vi.fn()

    return {
      loading,
      recentCalls,
      series,
      fetchMetrics,
      fetchLlmMetrics,
      setAutoRefresh,
    }
  }),
}))

vi.mock('vue-router', () => ({
  RouterLink: { template: '<a><slot /></a>' },
  useRoute: () => ({ params: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}))

describe('OverviewPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.spyOn(adminApi, 'getSummary').mockResolvedValue({
      total_agents: 1,
      total_tools: 1,
      total_knowledge: 0,
      total_workflows: 0,
      total_llms: 1,
      total_memories: 0,
      system_health: 'healthy',
      total_llm_calls_today: 2,
      total_tokens_today: 100,
    })
    vi.spyOn(adminApi, 'getAllResources').mockResolvedValue([])
    vi.spyOn(adminApi, 'getLlmMetrics').mockResolvedValue({
      series: [],
      total_calls: 0,
      total_tokens: 0,
      alerts: [],
      recent_calls: [],
    })
  })

  it('mounts overview modules', async () => {
    const monitoringStore = useMonitoringStore()
    const fetchLlmMetricsSpy = vi.spyOn(monitoringStore, 'fetchLlmMetrics')
    const wrapper = mount(OverviewPage)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Component Status')
    expect(wrapper.text()).toContain('LLM Activity Trend')
    expect(wrapper.text()).toContain('Recent Calls')
    expect(fetchLlmMetricsSpy).toHaveBeenCalled()
  })

  it('syncs monitoring auto refresh with page visibility', async () => {
    const monitoringStore = useMonitoringStore()
    const setAutoRefreshSpy = vi.spyOn(monitoringStore, 'setAutoRefresh').mockImplementation(() => {})
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState')

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })

    const wrapper = mount(OverviewPage)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(setAutoRefreshSpy).toHaveBeenCalledWith(true, 30000)

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(setAutoRefreshSpy).toHaveBeenCalledWith(false, 30000)

    wrapper.unmount()
    expect(setAutoRefreshSpy).toHaveBeenCalledWith(false)

    if (visibilityDescriptor) {
      Object.defineProperty(document, 'visibilityState', visibilityDescriptor)
    }
  })
})
