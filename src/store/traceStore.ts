import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getSessionTrace, getSessions } from '../api/admin'
import type { SessionRecord, TraceResponse } from '../types/admin'

export const useTraceStore = defineStore('trace', () => {
  const agentId = ref('')
  const sessions = ref<SessionRecord[]>([])
  const selectedSessionId = ref('')
  const trace = ref<TraceResponse | null>(null)
  const loadingSessions = ref(false)
  const loadingTrace = ref(false)
  const error = ref('')

  const selectedSession = computed(
    () => sessions.value.find((session) => session.id === selectedSessionId.value) ?? null,
  )

  const timeline = computed(() => trace.value?.timeline ?? [])

  const fetchSessions = async (nextAgentId: string) => {
    agentId.value = nextAgentId
    loadingSessions.value = true
    error.value = ''

    try {
      sessions.value = await getSessions(nextAgentId)
    } catch (fetchError) {
      sessions.value = []
      error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load sessions'
    } finally {
      loadingSessions.value = false
    }
  }

  const fetchTrace = async (sessionId: string) => {
    if (!sessionId) {
      trace.value = null
      selectedSessionId.value = ''
      return
    }

    selectedSessionId.value = sessionId
    loadingTrace.value = true
    error.value = ''

    try {
      trace.value = await getSessionTrace(sessionId)
    } catch (fetchError) {
      trace.value = null
      error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load trace'
    } finally {
      loadingTrace.value = false
    }
  }

  const loadAgentTrace = async (nextAgentId: string, preferredSessionId = '') => {
    await fetchSessions(nextAgentId)

    const sessionId =
      preferredSessionId && sessions.value.some((session) => session.id === preferredSessionId)
        ? preferredSessionId
        : sessions.value[0]?.id ?? ''

    if (sessionId) {
      await fetchTrace(sessionId)
    } else {
      trace.value = null
      selectedSessionId.value = ''
    }
  }

  return {
    agentId,
    sessions,
    selectedSessionId,
    selectedSession,
    trace,
    timeline,
    loadingSessions,
    loadingTrace,
    error,
    fetchSessions,
    fetchTrace,
    loadAgentTrace,
  }
})
