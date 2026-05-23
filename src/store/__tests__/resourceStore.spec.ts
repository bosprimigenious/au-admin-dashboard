import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '../../api/admin'
import { useResourceStore } from '../resourceStore'
import type { ResourceRecord } from '../../types/admin'

const sampleResources: ResourceRecord[] = [
  {
    id: 'agent-1',
    name: 'Demo Agent',
    type: 'agent',
    status: 'running',
    description: 'Agent resource',
    model: 'Not exposed',
    version: 'Phase 1',
    owner: 'System',
    updatedAt: 'Not exposed',
    tags: [],
  },
  {
    id: 'tool-1',
    name: 'Search Tool',
    type: 'tool',
    status: 'running',
    description: 'Tool resource',
    model: 'Not exposed',
    version: 'Phase 1',
    owner: 'System',
    updatedAt: 'Not exposed',
    tags: [],
  },
  {
    id: 'kb-1',
    name: 'Knowledge Base',
    type: 'knowledge',
    status: 'running',
    description: 'Knowledge resource',
    model: 'Not exposed',
    version: 'Phase 1',
    owner: 'System',
    updatedAt: 'Not exposed',
    tags: [],
  },
  {
    id: 'wf-1',
    name: 'Workflow',
    type: 'workflow',
    status: 'running',
    description: 'Workflow resource',
    model: 'Not exposed',
    version: 'Phase 1',
    owner: 'System',
    updatedAt: 'Not exposed',
    tags: [],
  },
]

describe('resourceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('并行加载四类资源并更新计数', async () => {
    vi.spyOn(adminApi, 'getAllResources').mockResolvedValue(sampleResources)

    const store = useResourceStore()
    await store.fetchResources()

    expect(store.resources).toHaveLength(4)
    expect(store.counts).toEqual({
      all: 4,
      agent: 1,
      tool: 1,
      knowledge: 1,
      workflow: 1,
    })
    expect(store.selectedResource?.id).toBe('agent-1')
  })

  it('按资源类型筛选时只展示对应条目', async () => {
    vi.spyOn(adminApi, 'getAllResources').mockResolvedValue(sampleResources)

    const store = useResourceStore()
    await store.fetchResources()
    store.setFilter('tool')

    expect(store.filteredResources).toHaveLength(1)
    expect(store.filteredResources[0]?.id).toBe('tool-1')
  })

  it('接口失败时保留错误信息', async () => {
    vi.spyOn(adminApi, 'getAllResources').mockRejectedValue(new Error('network error'))

    const store = useResourceStore()
    await store.fetchResources()

    expect(store.error).toBe('network error')
    expect(store.resources).toHaveLength(0)
  })
})
