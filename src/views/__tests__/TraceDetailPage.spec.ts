import { createPinia, defineStore, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TraceDetailPage from '../../views/TraceDetailPage.vue'

const routerReplaceMock = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  RouterLink: { template: '<a><slot /></a>' },
  useRoute: () => ({ params: {}, path: '/trace' }),
  useRouter: () => ({ replace: routerReplaceMock }),
}))

vi.mock('../../store/traceStore', () => ({
  useTraceStore: defineStore('trace', () => {
    const agentId = ref('')
    const sessions = ref([])
    const selectedSessionId = ref('')
    const trace = ref(null)
    const timeline = ref([])
    const loadingSessions = ref(false)
    const loadingTrace = ref(false)
    const error = ref('')
    const loadAgentTrace = vi.fn().mockResolvedValue(undefined)
    const fetchTrace = vi.fn().mockResolvedValue(undefined)

    return {
      agentId,
      sessions,
      selectedSessionId,
      trace,
      timeline,
      loadingSessions,
      loadingTrace,
      error,
      loadAgentTrace,
      fetchTrace,
    }
  }),
}))

describe('TraceDetailPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows an empty state when no sessions exist', async () => {
    const wrapper = mount(TraceDetailPage)
    await Promise.resolve()
    await Promise.resolve()

    expect(wrapper.text()).toContain('暂无会话记录')
    expect(wrapper.text()).toContain('Optimization Suggestions')

    await wrapper.get('button').trigger('click')

    expect(routerReplaceMock).toHaveBeenCalledWith('/resources')
  })
})
