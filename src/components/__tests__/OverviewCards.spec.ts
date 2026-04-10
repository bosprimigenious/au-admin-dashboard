import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import OverviewCards from '../OverviewCards.vue'
import * as adminApi from '../../api/admin'

describe('OverviewCards', () => {
  it('在空数据加载阶段渲染占位骨架字符', () => {
    setActivePinia(createPinia())
    vi.spyOn(adminApi, 'getSummary').mockImplementation(
      () => new Promise(() => {}) as ReturnType<typeof adminApi.getSummary>,
    )

    const wrapper = mount(OverviewCards, {
      global: {
        plugins: [createPinia()],
      },
    })

    expect(wrapper.text()).toContain('—')
  })

  it('接口失败时渲染异常回退文案', async () => {
    setActivePinia(createPinia())
    vi.spyOn(adminApi, 'getSummary').mockRejectedValue(new Error('network error'))

    const wrapper = mount(OverviewCards, {
      global: {
        plugins: [createPinia()],
      },
    })

    await Promise.resolve()
    await nextTick()

    expect(wrapper.text()).toContain('资源汇总加载失败')
  })
})
