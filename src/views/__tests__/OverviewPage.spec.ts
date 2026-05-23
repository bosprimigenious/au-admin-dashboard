import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '../../api/admin'
import OverviewPage from '../../views/OverviewPage.vue'

vi.mock('vue-router', () => ({
  RouterLink: { template: '<a><slot /></a>' },
  useRoute: () => ({ params: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}))

describe('OverviewPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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
    const wrapper = mount(OverviewPage)
    await Promise.resolve()
    expect(wrapper.text()).toContain('Component Status')
    expect(wrapper.text()).toContain('Recent Calls')
  })
})
