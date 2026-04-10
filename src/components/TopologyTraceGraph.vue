<template>
  <div class="h-full min-h-[400px] glass-card flex flex-col">
    <h3 class="text-lg font-medium text-slate-200 mb-4">Execution Topology Trace</h3>
    <div class="flex-1 border border-slate-700/50 border-dashed rounded-xl p-4">
      <ul v-if="nodes.length" class="space-y-3">
        <li
          v-for="node in nodes"
          :key="node.id"
          class="flex items-center justify-between text-sm rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-800/50"
        >
          <span class="text-slate-200">{{ node.label }}</span>
          <span
            class="text-xs px-2 py-1 rounded-md"
            :class="
              node.status === 'ok'
                ? 'bg-emerald-500/20 text-emerald-300'
                : node.status === 'warning'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-red-500/20 text-red-300'
            "
          >
            {{ node.status }}
          </span>
        </li>
      </ul>
      <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm text-center px-6">
        Loading trace topology...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getTracePayload } from '../api/admin'
import { useAppStore } from '../store/appStore'
import type { TraceNode } from '../types/admin'

const nodes = ref<TraceNode[]>([])
const appStore = useAppStore()

onMounted(async () => {
  appStore.setGlobalLoading(true)
  try {
    const payload = await getTracePayload(appStore.selectedAgentId)
    nodes.value = payload.nodes
  } finally {
    appStore.setGlobalLoading(false)
  }
})
</script>
