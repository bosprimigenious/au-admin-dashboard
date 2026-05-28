import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TopologyTraceGraph from '../TopologyTraceGraph.vue'

vi.mock('@antv/g6', () => ({
  Graph: class MockGraph {
    constructor() {
      throw new Error('graph unavailable in test')
    }
  },
}))

const trace = {
  session_id: 'session-1',
  agent_id: 'agent-1',
  nodes: [
    {
      id: 'n1',
      name: 'Start Agent',
      type: 'agent',
      start_time: '',
      end_time: '',
      duration: 12,
      status: 'success',
      error: null,
    },
    {
      id: 'n2',
      name: 'Critical LLM',
      type: 'llm',
      start_time: '',
      end_time: '',
      duration: 48,
      status: 'failed',
      error: 'timeout',
    },
  ],
  edges: [{ source: 'n1', target: 'n2', label: 'calls' }],
  timeline: [],
}

describe('TopologyTraceGraph', () => {
  it('shows search and trace legend controls', () => {
    const wrapper = mount(TopologyTraceGraph, {
      props: {
        trace,
        loading: false,
      },
    })

    expect(wrapper.get('input[type="search"]').attributes('placeholder')).toBe('Search node name')
    expect(wrapper.text()).toContain('Failed Nodes')
    expect(wrapper.text()).toContain('Critical Path')
  })

  it('highlights matching nodes in fallback list', async () => {
    const wrapper = mount(TopologyTraceGraph, {
      props: {
        trace,
        loading: false,
      },
    })

    await wrapper.get('input[type="search"]').setValue('critical')

    expect(wrapper.text()).toContain('Critical LLM')
  })
})
