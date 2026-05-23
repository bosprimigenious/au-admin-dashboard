<template>
  <div class="glass-card h-full">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium text-slate-200">Recent Calls</h3>
        <p class="mt-1 text-xs text-slate-500">Latest LLM activity in the selected window</p>
      </div>
      <span v-if="loading" class="text-xs text-cyan-300/80">Refreshing...</span>
    </div>

    <ul v-if="calls.length" class="space-y-3">
      <li
        v-for="(call, index) in calls"
        :key="`${call.ts}-${index}`"
        class="rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="truncate text-sm text-slate-200">{{ call.label }}</p>
          <span class="text-xs text-cyan-300/80">{{ call.tokens }} tokens</span>
        </div>
        <p class="mt-1 text-xs text-slate-500">{{ call.ts }}</p>
      </li>
    </ul>
    <p v-else class="text-sm text-slate-500">No recent calls recorded.</p>
  </div>
</template>

<script setup lang="ts">
import type { RecentCall } from '../types/admin'

withDefaults(
  defineProps<{
    calls: RecentCall[]
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)
</script>
