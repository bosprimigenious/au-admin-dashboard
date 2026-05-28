import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SkeletonCard from '../SkeletonCard.vue'

describe('SkeletonCard', () => {
  it('renders a loading skeleton with stable placeholder blocks', () => {
    const wrapper = mount(SkeletonCard)

    expect(wrapper.classes()).toContain('glass-card')
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
    expect(wrapper.findAll('.rounded-full').length).toBeGreaterThanOrEqual(5)
  })

  it('does not render textual content while loading', () => {
    const wrapper = mount(SkeletonCard)

    expect(wrapper.text()).toBe('')
  })
})
