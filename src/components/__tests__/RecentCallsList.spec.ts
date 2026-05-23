import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RecentCallsList from '../RecentCallsList.vue'

describe('RecentCallsList', () => {
  it('renders recent call entries', () => {
    const wrapper = mount(RecentCallsList, {
      props: {
        calls: [{ ts: '2026-04-01 10:00:00', label: 'demo_llm', tokens: 128 }],
      },
    })

    expect(wrapper.text()).toContain('demo_llm')
    expect(wrapper.text()).toContain('128 tokens')
  })
})
