<template>
  <div class="glass-card">
    <h3 class="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Timeline</h3>
    <ul v-if="steps.length" class="space-y-3">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="flex cursor-pointer items-start gap-4 rounded-xl border px-4 py-3 transition"
        :class="
          selectedNodeId === step.id
            ? 'border-cyan-300/30 bg-cyan-300/10'
            : 'border-slate-800/70 bg-slate-950/60 hover:border-slate-700'
        "
        @click="emit('select', step.id)"
      >
        <span class="mt-0.5 text-xs font-semibold text-cyan-300/80">{{ index + 1 }}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-slate-200">{{ step.name }}</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ step.type }} · {{ step.start_time || 'unknown start' }} · {{ step.duration.toFixed(0) }} ms
          </p>
        </div>
        <span class="rounded-md px-2 py-1 text-xs" :class="timelineStatusClass(step.status)">
          {{ step.status }}
        </span>
      </li>
    </ul>
    <p v-else class="text-sm text-slate-500">{{ emptyMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import type { TraceNode, TraceNodeStatus } from '../types/admin'

withDefaults(
  defineProps<{
    steps: TraceNode[]
    selectedNodeId?: string
    emptyMessage?: string
  }>(),
  {
    selectedNodeId: '',
    emptyMessage: 'Timeline steps will appear after a session trace is loaded.',
  },
)

const emit = defineEmits<{
  select: [nodeId: string]
}>()

const timelineStatusClass = (status: TraceNodeStatus) => {
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
