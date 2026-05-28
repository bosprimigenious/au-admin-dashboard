import { createPinia, defineStore, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ServicePage from '../../views/ServicePage.vue'

vi.mock('../../store/resourceStore', () => ({
  useResourceStore: defineStore('resource', () => {
    const resources = ref([
      {
        id: 'llm-1',
        name: 'Primary LLM',
        type: 'llm',
        status: 'running',
        description: 'Primary runtime',
        model: 'Model A',
        version: 'v1',
        owner: 'System',
        updatedAt: 'now',
        tags: [],
      },
      {
        id: 'tool-1',
        name: 'Search Tool',
        type: 'tool',
        status: 'warning',
        description: 'Search runtime',
        model: 'Model B',
        version: 'v2',
        owner: 'System',
        updatedAt: 'now',
        tags: [],
      },
    ])

    return {
      resources,
    }
  }),
}))

describe('ServicePage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the service management dashboard', () => {
    const wrapper = mount(ServicePage)

    expect(wrapper.text()).toContain('Service Management')
    expect(wrapper.text()).toContain('Control-plane services')
    expect(wrapper.text()).toContain('Primary LLM')
    expect(wrapper.text()).toContain('Search Tool')
    expect(wrapper.text()).toContain('Start')
    expect(wrapper.text()).toContain('Stop')
  })
})
