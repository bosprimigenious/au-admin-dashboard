import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TimelineView from '../TimelineView.vue'

describe('TimelineView', () => {
  it('emits select when a step is clicked', async () => {
    const wrapper = mount(TimelineView, {
      props: {
        steps: [
          {
            id: 'node-1',
            name: 'Step 1',
            type: 'llm',
            start_time: '',
            end_time: '',
            duration: 100,
            status: 'success',
          },
        ],
      },
    })

    await wrapper.find('li').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['node-1'])
  })
})
