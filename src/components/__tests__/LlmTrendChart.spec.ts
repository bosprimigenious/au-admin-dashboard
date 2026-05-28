import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import LlmTrendChart from '../LlmTrendChart.vue'

const chartMock = vi.hoisted(() => ({
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  init: vi.fn(() => ({
    setOption: chartMock.setOption,
    resize: chartMock.resize,
    dispose: chartMock.dispose,
  })),
}))

vi.mock('echarts', () => ({
  init: chartMock.init,
}))

const series = [
  { ts: '2026-05-22', calls: 12, tokens: 1200 },
  { ts: '2026-05-23', calls: 18, tokens: 2400 },
]

describe('LlmTrendChart', () => {
  afterEach(() => {
    chartMock.setOption.mockClear()
    chartMock.resize.mockClear()
    chartMock.dispose.mockClear()
    chartMock.init.mockClear()
  })

  it('shows loading state without initializing the chart', () => {
    const wrapper = mount(LlmTrendChart, {
      props: {
        series: [],
        loading: true,
      },
    })

    expect(wrapper.text()).toContain('Loading trend data...')
    expect(chartMock.init).not.toHaveBeenCalled()
  })

  it('shows custom empty state when no series is available', () => {
    const wrapper = mount(LlmTrendChart, {
      props: {
        series: [],
        emptyMessage: 'No LLM calls yet.',
      },
    })

    expect(wrapper.text()).toContain('No LLM calls yet.')
    expect(chartMock.init).not.toHaveBeenCalled()
  })

  it('renders chart options from the provided series', async () => {
    const wrapper = mount(LlmTrendChart, {
      attachTo: document.body,
      props: {
        title: 'LLM Calls',
        subtitle: 'Last 7 days',
        series: [],
      },
    })

    await wrapper.setProps({ series })
    await nextTick()

    expect(chartMock.init).toHaveBeenCalledOnce()
    expect(chartMock.setOption).toHaveBeenCalledWith(
      expect.objectContaining({
        xAxis: expect.objectContaining({ data: ['2026-05-22', '2026-05-23'] }),
        series: expect.arrayContaining([
          expect.objectContaining({ name: 'Calls', data: [12, 18] }),
          expect.objectContaining({ name: 'Tokens', data: [1200, 2400] }),
        ]),
      }),
    )
  })

  it('updates chart options when series changes', async () => {
    const wrapper = mount(LlmTrendChart, {
      attachTo: document.body,
      props: { series: [] },
    })

    await wrapper.setProps({ series })
    await nextTick()
    chartMock.setOption.mockClear()

    await wrapper.setProps({
      series: [{ ts: '2026-05-24', calls: 3, tokens: 600 }],
    })
    await nextTick()

    expect(chartMock.setOption).toHaveBeenLastCalledWith(
      expect.objectContaining({
        xAxis: expect.objectContaining({ data: ['2026-05-24'] }),
      }),
    )
  })
})
