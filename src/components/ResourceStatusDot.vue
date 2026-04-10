<template>
  <span class="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
    <span class="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]" :class="statusClass" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ResourceStatus } from '../types/admin'

const props = defineProps<{
  status: ResourceStatus
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case 'running':
      return 'bg-emerald-400 text-emerald-400'
    case 'idle':
      return 'bg-slate-400 text-slate-400'
    case 'warning':
      return 'bg-amber-400 text-amber-400'
    case 'error':
      return 'bg-rose-400 text-rose-400'
    case 'draft':
      return 'bg-cyan-400 text-cyan-400'
    default:
      return 'bg-slate-500 text-slate-500'
  }
})

const label = computed(() => props.status.charAt(0).toUpperCase() + props.status.slice(1))
</script>
