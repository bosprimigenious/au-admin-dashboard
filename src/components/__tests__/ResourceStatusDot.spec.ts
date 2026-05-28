import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ResourceStatusDot from '../ResourceStatusDot.vue'
import type { ResourceStatus } from '../../types/admin'

describe('ResourceStatusDot', () => {
  it.each([
    ['running', 'Running', 'bg-emerald-400'],
    ['idle', 'Idle', 'bg-slate-400'],
    ['warning', 'Warning', 'bg-amber-400'],
    ['error', 'Error', 'bg-rose-400'],
    ['draft', 'Draft', 'bg-cyan-400'],
    ['unknown', 'Unknown', 'bg-slate-500'],
  ] satisfies [ResourceStatus, string, string][])('renders %s status', (status, label, className) => {
    const wrapper = mount(ResourceStatusDot, {
      props: { status },
    })

    expect(wrapper.text()).toContain(label)
    expect(wrapper.get('span span').classes()).toContain(className)
  })

  it('updates label and color when status changes', async () => {
    const wrapper = mount(ResourceStatusDot, {
      props: { status: 'running' },
    })

    await wrapper.setProps({ status: 'error' })

    expect(wrapper.text()).toContain('Error')
    expect(wrapper.get('span span').classes()).toContain('bg-rose-400')
  })
})
