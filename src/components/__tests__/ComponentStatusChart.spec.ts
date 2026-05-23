import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentStatusChart from '../ComponentStatusChart.vue'

describe('ComponentStatusChart', () => {
  it('renders empty state without chart data', () => {
    const wrapper = mount(ComponentStatusChart, {
      props: { items: [] },
    })

    expect(wrapper.text()).toContain('No resource data loaded yet.')
  })
})
