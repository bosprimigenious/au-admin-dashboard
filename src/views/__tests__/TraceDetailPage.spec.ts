import { createPinia, defineStore, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TraceDetailPage from '../../views/TraceDetailPage.vue'
import { useTraceStore } from '../../store/traceStore'

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
    vi.useRealTimers()
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

  it('replays timeline steps and highlights the active node', async () => {
    vi.useFakeTimers()
    const traceStore = useTraceStore()
    traceStore.agentId = 'agent-1'
    traceStore.selectedSessionId = 'session-1'
    traceStore.sessions = [
      {
        id: 'session-1',
        name: 'Session 1',
        description: 'demo',
        component_type: 'SESSION',
        status: 'ACTIVE',
      },
    ]
    traceStore.trace = {
      session_id: 'session-1',
      agent_id: 'agent-1',
      nodes: [
        {
          id: 'node-1',
          name: 'Step 1',
          type: 'agent',
          start_time: '',
          end_time: '',
          duration: 10,
          status: 'success',
        },
        {
          id: 'node-2',
          name: 'Step 2',
          type: 'llm',
          start_time: '',
          end_time: '',
          duration: 20,
          status: 'success',
        },
      ],
      edges: [{ source: 'node-1', target: 'node-2', label: 'invoke' }],
      timeline: [],
    }
    traceStore.timeline = traceStore.trace.nodes

    const wrapper = mount(TraceDetailPage, {
      global: {
        stubs: {
          TopologyTraceGraph: {
            props: ['activeNodeId'],
            template: '<div data-test="topology">active: {{ activeNodeId }}</div>',
          },
          OptimizationPanel: true,
          SafetyRadarPanel: true,
        },
      },
    })
    await Promise.resolve()

    expect(wrapper.text()).toContain('Replay')
    expect(wrapper.text()).toContain('Step 1 of 2')
    expect(wrapper.get('select[aria-label="Replay speed"]').text()).toContain('4x')

    await wrapper.findAll('button').find((button) => button.text().includes('Step'))?.trigger('click')
    expect(wrapper.text()).toContain('Step 2 of 2')
    expect(wrapper.get('[data-test="topology"]').text()).toContain('node-2')

    await wrapper.findAll('button').find((button) => button.text().includes('Play'))?.trigger('click')
    expect(wrapper.text()).toContain('Pause')
    vi.advanceTimersByTime(1200)
    await Promise.resolve()
    expect(wrapper.text()).toContain('Step 1 of 2')
  })
})
