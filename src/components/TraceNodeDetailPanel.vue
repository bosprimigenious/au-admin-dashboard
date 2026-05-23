<template>
  <div class="glass-card">
    <h3 class="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Node Detail</h3>

    <p v-if="!node" class="text-sm text-slate-500">
      Click a topology node or timeline step to inspect execution metadata.
    </p>

    <dl v-else class="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
      <div>
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">Name</dt>
        <dd class="mt-1 text-slate-100">{{ node.name }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">Type</dt>
        <dd class="mt-1 text-slate-200">{{ node.type }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">Status</dt>
        <dd class="mt-1">
          <span class="rounded-md px-2 py-1 text-xs" :class="statusClass(node.status)">{{ node.status }}</span>
        </dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">Duration</dt>
        <dd class="mt-1 text-slate-200">{{ node.duration.toFixed(0) }} ms</dd>
      </div>
      <div class="md:col-span-2">
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">Node ID</dt>
        <dd class="mt-1 break-all font-mono text-xs text-slate-400">{{ node.id }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">Start</dt>
        <dd class="mt-1 text-slate-300">{{ node.start_time || 'unknown' }}</dd>
      </div>
      <div>
        <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">End</dt>
        <dd class="mt-1 text-slate-300">{{ node.end_time || 'unknown' }}</dd>
      </div>
      <div v-if="node.error" class="md:col-span-2">
        <dt class="text-xs uppercase tracking-[0.18em] text-red-300/80">Error</dt>
        <dd class="mt-1 text-red-200">{{ node.error }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import type { TraceNode, TraceNodeStatus } from '../types/admin'

defineProps<{
  node: TraceNode | null
}>()

const statusClass = (status: TraceNodeStatus) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-500/20 text-emerald-300'
    case 'failed':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-amber-500/20 text-amber-300'
  }
}
</script>
