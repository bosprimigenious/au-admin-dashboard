import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TopologyTraceGraph from '../TopologyTraceGraph.vue'

const graphMock = vi.hoisted(() => ({
  shouldThrow: true,
  handlers: new Map<string, (event: unknown) => void>(),
  render: vi.fn(() => Promise.resolve()),
  setData: vi.fn(() => Promise.resolve()),
  setSize: vi.fn(),
  destroy: vi.fn(),
}))

vi.mock('@antv/g6', () => ({
  Graph: class MockGraph {
    constructor() {
      if (graphMock.shouldThrow) {
        throw new Error('graph unavailable in test')
      }
    }

    on(eventName: string, handler: (event: unknown) => void) {
      graphMock.handlers.set(eventName, handler)
    }

    render = graphMock.render
    setData = graphMock.setData
    setSize = graphMock.setSize
    destroy = graphMock.destroy
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
  beforeEach(() => {
    graphMock.shouldThrow = true
    graphMock.handlers.clear()
    graphMock.render.mockClear()
    graphMock.setData.mockClear()
    graphMock.setSize.mockClear()
    graphMock.destroy.mockClear()
  })

  it('shows loading and empty states', async () => {
    const wrapper = mount(TopologyTraceGraph, {
      props: {
        trace: null,
        loading: true,
      },
    })

    expect(wrapper.text()).toContain('Building topology graph...')

    await wrapper.setProps({
      loading: false,
      emptyMessage: 'Pick a trace session.',
    })

    expect(wrapper.text()).toContain('Pick a trace session.')
  })

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
    expect(wrapper.findAll('li')[1].classes()).toContain('border-cyan-300/60')
  })

  it('marks failed nodes in fallback list', () => {
    const wrapper = mount(TopologyTraceGraph, {
      props: {
        trace,
        loading: false,
      },
    })

    expect(wrapper.findAll('li')[1].classes()).toContain('border-red-400/70')
    expect(wrapper.text()).toContain('failed')
  })

  it('emits selected node id from graph node clicks', async () => {
    graphMock.shouldThrow = false

    const wrapper = mount(TopologyTraceGraph, {
      attachTo: document.body,
      props: {
        trace,
        loading: false,
      },
    })

    await nextTick()
    await Promise.resolve()
    graphMock.handlers.get('node:click')?.({ target: { id: 'n2' } })

    expect(wrapper.emitted('node-select')).toEqual([['n2']])
  })
})
