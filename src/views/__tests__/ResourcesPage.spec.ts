import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '../../api/admin'
import { useResourceStore } from '../../store/resourceStore'
import ResourcesPage from '../../views/ResourcesPage.vue'

describe('ResourcesPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.spyOn(adminApi, 'getAllResources').mockResolvedValue([])
  })

  it('debounces resource search updates', async () => {
    vi.useFakeTimers()
    const resourceStore = useResourceStore()
    const setSearchQuerySpy = vi.spyOn(resourceStore, 'setSearchQuery').mockImplementation(() => {})

    const wrapper = mount(ResourcesPage)
    await Promise.resolve()
    await Promise.resolve()

    const searchInput = wrapper.get('input[placeholder="Find by name, model, tag..."]')
    await searchInput.setValue('a')
    await searchInput.setValue('ag')
    await searchInput.setValue('age')

    expect(setSearchQuerySpy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(299)
    expect(setSearchQuerySpy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(setSearchQuerySpy).toHaveBeenCalledTimes(1)
    expect(setSearchQuerySpy).toHaveBeenCalledWith('age')

    wrapper.unmount()
    vi.useRealTimers()
  })
})
