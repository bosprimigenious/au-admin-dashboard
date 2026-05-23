import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as adminApi from '../../api/admin'
import { useTraceStore } from '../traceStore'
import type { SessionRecord, TraceResponse } from '../../types/admin'

const sessions: SessionRecord[] = [
  {
    id: 'session-1',
    name: 'session-1',
    description: 'messages=2',
    component_type: 'SESSION',
    status: 'ACTIVE',
  },
]

const trace: TraceResponse = {
  session_id: 'session-1',
  agent_id: 'demo_agent',
  nodes: [
    {
      id: 'agent-demo_agent',
      name: 'demo_agent',
      type: 'agent',
      start_time: '',
      end_time: '',
      duration: 0,
      status: 'success',
    },
  ],
  edges: [],
  timeline: [],
}

describe('traceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('loads sessions and auto-selects the first trace', async () => {
    vi.spyOn(adminApi, 'getSessions').mockResolvedValue(sessions)
    vi.spyOn(adminApi, 'getSessionTrace').mockResolvedValue(trace)

    const store = useTraceStore()
    await store.loadAgentTrace('demo_agent')

    expect(store.sessions).toHaveLength(1)
    expect(store.selectedSessionId).toBe('session-1')
    expect(store.trace?.session_id).toBe('session-1')
  })

  it('loads a preferred session when provided', async () => {
    vi.spyOn(adminApi, 'getSessions').mockResolvedValue(sessions)
    vi.spyOn(adminApi, 'getSessionTrace').mockResolvedValue(trace)

    const store = useTraceStore()
    await store.loadAgentTrace('demo_agent', 'session-1')

    expect(adminApi.getSessionTrace).toHaveBeenCalledWith('session-1')
  })

  it('clears trace when agent has no sessions', async () => {
    vi.spyOn(adminApi, 'getSessions').mockResolvedValue([])

    const store = useTraceStore()
    await store.loadAgentTrace('demo_agent')

    expect(store.trace).toBeNull()
    expect(store.selectedSessionId).toBe('')
  })
})
