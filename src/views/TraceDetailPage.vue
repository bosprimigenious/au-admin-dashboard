<template>
  <section class="space-y-6">
    <div class="glass-card">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Agent Topology Trace</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-100">Session execution graph</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Select an agent session to inspect message-level execution steps rendered as a topology graph.
          </p>
        </div>
        <label class="flex min-w-[260px] flex-col gap-2 text-sm text-slate-400">
          <span class="text-xs uppercase tracking-[0.22em] text-slate-500">Agent ID</span>
          <input
            :value="agentInput"
            type="text"
            class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-slate-200 outline-none"
            placeholder="Enter agent id"
            @change="handleAgentSubmit(($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </div>

    <div v-if="error" class="glass-card border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,2.2fr)]">
      <aside class="glass-card h-fit">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Sessions</h3>
          <span class="text-xs text-slate-500">{{ sessions.length }} loaded</span>
        </div>

        <div v-if="loadingSessions" class="space-y-3">
          <div v-for="index in 4" :key="index" class="h-16 animate-pulse rounded-xl bg-slate-900/70" />
        </div>

        <EmptyState
          v-else-if="!sessions.length"
          title="No sessions found"
          description="This agent has no persisted sessions yet. Run an agent conversation first, then refresh."
          action-label="Reload Sessions"
          @action="reloadCurrentAgent"
        />

        <ul v-else class="space-y-3">
          <li v-for="session in sessions" :key="session.id">
            <button
              type="button"
              class="w-full rounded-xl border px-4 py-3 text-left transition"
              :class="
                selectedSessionId === session.id
                  ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                  : 'border-slate-800/70 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
              "
              @click="selectSession(session.id)"
            >
              <p class="text-sm font-medium">{{ session.name }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ session.description }}</p>
            </button>
          </li>
        </ul>
      </aside>

      <div class="space-y-8">
        <TopologyTraceGraph
          :trace="trace"
          :loading="loadingTrace"
          empty-message="Choose a session from the left panel to render its execution topology."
          @node-select="selectNode"
        />

        <TraceNodeDetailPanel :node="selectedNode" />

        <TimelineView :steps="timeline" :selected-node-id="selectedNodeId" @select="selectNode" />

        <SafetyRadarPanel :diagnostics="trace?.diagnostics ?? null" :loading="loadingTrace" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import EmptyState from '../components/EmptyState.vue'
import SafetyRadarPanel from '../components/SafetyRadarPanel.vue'
import TimelineView from '../components/TimelineView.vue'
import TraceNodeDetailPanel from '../components/TraceNodeDetailPanel.vue'
import TopologyTraceGraph from '../components/TopologyTraceGraph.vue'
import { useAppStore } from '../store/appStore'
import { useTraceStore } from '../store/traceStore'
import type { TraceNode } from '../types/admin'

const props = defineProps<{
  agentId?: string
  sessionId?: string
}>()

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const traceStore = useTraceStore()

const agentInput = ref('')
const selectedNodeId = ref('')

const selectedNode = computed<TraceNode | null>(() => {
  if (!trace.value || !selectedNodeId.value) {
    return null
  }
  return trace.value.nodes.find((node) => node.id === selectedNodeId.value) ?? null
})

const {
  agentId: activeAgentId,
  sessions,
  selectedSessionId,
  trace,
  timeline,
  loadingSessions,
  loadingTrace,
  error,
} = storeToRefs(traceStore)

const resolveAgentId = () => {
  const fromRoute = typeof route.params.agentId === 'string' ? route.params.agentId : ''
  return props.agentId || fromRoute || appStore.selectedAgentId
}

const resolveSessionId = () => {
  const fromRoute = typeof route.params.sessionId === 'string' ? route.params.sessionId : ''
  return props.sessionId || fromRoute
}

const syncRoute = (nextAgentId: string, nextSessionId = '') => {
  const target = nextSessionId ? `/trace/${nextAgentId}/${nextSessionId}` : `/trace/${nextAgentId}`
  if (route.path !== target) {
    void router.replace(target)
  }
}

const reloadCurrentAgent = async () => {
  const nextAgentId = agentInput.value.trim() || resolveAgentId()
  if (!nextAgentId) {
    return
  }

  appStore.setSelectedAgentId(nextAgentId)
  agentInput.value = nextAgentId
  await traceStore.loadAgentTrace(nextAgentId)
  syncRoute(nextAgentId, traceStore.selectedSessionId)
}

const selectNode = (nodeId: string) => {
  selectedNodeId.value = nodeId
}

const selectSession = async (sessionId: string) => {
  selectedNodeId.value = ''
  await traceStore.fetchTrace(sessionId)
  syncRoute(activeAgentId.value, sessionId)
}

const handleAgentSubmit = async (value: string) => {
  agentInput.value = value.trim()
  await reloadCurrentAgent()
}

watch(
  () => [route.params.agentId, route.params.sessionId],
  async () => {
    const nextAgentId = resolveAgentId()
    const nextSessionId = resolveSessionId()
    if (!nextAgentId) {
      return
    }

    agentInput.value = nextAgentId
    appStore.setSelectedAgentId(nextAgentId)
    await traceStore.loadAgentTrace(nextAgentId, nextSessionId)
  },
)

onMounted(async () => {
  await reloadCurrentAgent()
})
</script>
