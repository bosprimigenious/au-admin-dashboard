import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EmptyState from '../EmptyState.vue'

describe('EmptyState', () => {
  it('renders the supplied title and description', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No sessions',
        description: 'Select a resource to inspect sessions.',
      },
    })

    expect(wrapper.text()).toContain('No sessions')
    expect(wrapper.text()).toContain('Select a resource to inspect sessions.')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('updates when props change', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Empty',
        description: 'Nothing here.',
      },
    })

    await wrapper.setProps({
      title: 'No resources',
      description: 'Connect a backend service first.',
    })

    expect(wrapper.text()).toContain('No resources')
    expect(wrapper.text()).toContain('Connect a backend service first.')
  })

  it('emits action when the optional button is clicked', async () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'No resources',
        description: 'Create one to continue.',
        actionLabel: 'Open Resources',
      },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('action')).toHaveLength(1)
  })
})
