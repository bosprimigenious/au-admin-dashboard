import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SystemHealthGauge from '../SystemHealthGauge.vue'

describe('SystemHealthGauge', () => {
  it('renders healthy state for scores at or above 80', () => {
    const wrapper = mount(SystemHealthGauge, {
      props: {
        health: 88,
      },
    })

    expect(wrapper.text()).toContain('System Health')
    expect(wrapper.text()).toContain('Healthy')
    expect(wrapper.text()).toContain('88')
  })

  it('renders degraded state for scores at or above 50', async () => {
    const wrapper = mount(SystemHealthGauge, {
      props: {
        health: 80,
      },
    })

    await wrapper.setProps({ health: 50 })

    expect(wrapper.text()).toContain('Degraded')
    expect(wrapper.text()).toContain('50')
  })

  it('clamps invalid low scores and renders attention state', () => {
    const wrapper = mount(SystemHealthGauge, {
      props: {
        health: -10,
      },
    })

    expect(wrapper.text()).toContain('Needs Attention')
    expect(wrapper.text()).toContain('0')
  })
})
