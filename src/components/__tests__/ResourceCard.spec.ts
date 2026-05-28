import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ResourceCard from '../ResourceCard.vue'
import type { ResourceRecord } from '../../types/admin'

const resource: ResourceRecord = {
  id: 'agent-1',
  name: 'Planner Agent',
  type: 'agent',
  status: 'running',
  description: 'Coordinates tool calls and LLM planning.',
  model: 'gpt-4.1',
  version: '1.0.0',
  owner: 'ops',
  updatedAt: '2026-05-28',
  tags: ['planning', 'prod', 'critical', 'hidden'],
}

describe('ResourceCard', () => {
  it('renders resource details and first three tags', () => {
    const wrapper = mount(ResourceCard, {
      props: { resource },
    })

    expect(wrapper.text()).toContain('Planner Agent')
    expect(wrapper.text()).toContain('Coordinates tool calls')
    expect(wrapper.text()).toContain('gpt-4.1')
    expect(wrapper.text()).toContain('1.0.0')
    expect(wrapper.text()).toContain('planning')
    expect(wrapper.text()).not.toContain('hidden')
  })

  it('adds selected styling when selected', async () => {
    const wrapper = mount(ResourceCard, {
      props: { resource, selected: false },
    })

    expect(wrapper.classes()).not.toContain('ring-1')

    await wrapper.setProps({ selected: true })

    expect(wrapper.classes()).toContain('ring-1')
  })

  it('emits select with resource id when clicked', async () => {
    const wrapper = mount(ResourceCard, {
      props: { resource },
    })

    await wrapper.get('article').trigger('click')

    expect(wrapper.emitted('select')).toEqual([['agent-1']])
  })

  it('does not render tag container for empty tags', () => {
    const wrapper = mount(ResourceCard, {
      props: {
        resource: {
          ...resource,
          tags: [],
        },
      },
    })

    expect(wrapper.findAll('.rounded-full').filter((node) => node.text() === 'planning')).toHaveLength(0)
  })
})
