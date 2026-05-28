<template>
  <div class="glass-card">
    <div class="mb-4 flex items-center justify-between gap-4">
      <div>
        <h3 class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Optimization Suggestions</h3>
        <p class="mt-1 text-xs text-slate-500">Session-level guidance from the backend optimization service.</p>
      </div>
      <span v-if="loading" class="text-xs text-cyan-300/80">Loading...</span>
    </div>

    <p v-if="!sessionId" class="text-sm text-slate-500">Select a session to view optimization suggestions.</p>
    <p v-else-if="error" class="text-sm text-red-200">{{ error }}</p>
    <p v-else-if="!loading && !suggestions.length" class="text-sm text-slate-500">
      No optimization suggestions available for this session.
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="(suggestion, index) in suggestions"
        :key="`${suggestion.category}-${index}`"
        class="rounded-xl border px-4 py-3"
        :class="severityClass(suggestion.severity)"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium text-slate-100">{{ suggestion.category }}</p>
          <span class="text-xs uppercase tracking-[0.18em]">{{ suggestion.severity }}</span>
        </div>
        <p class="mt-2 text-sm leading-6 text-slate-300">{{ suggestion.message }}</p>
        <p class="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">Action</p>
        <p class="mt-1 text-sm text-slate-200">{{ suggestion.action }}</p>
        <p v-if="(suggestion as SuggestionWithNodes).related_nodes?.length" class="mt-3 text-xs text-slate-500">
          Related nodes: {{ (suggestion as SuggestionWithNodes).related_nodes?.join(', ') }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { getSessionOptimization } from '../api/admin'
import type { OptimizationSuggestion } from '../types/admin'

interface SuggestionWithNodes extends OptimizationSuggestion {
  related_nodes?: string[]
}

const props = defineProps<{
  sessionId: string
}>()

const loading = ref(false)
const error = ref('')
const suggestions = ref<SuggestionWithNodes[]>([])

const severityClass = (severity: string) => {
  switch (severity.trim().toLowerCase()) {
    case 'critical':
      return 'border-red-500/30 bg-red-500/10 text-red-200'
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
    default:
      return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100'
  }
}

const loadSuggestions = async () => {
  if (!props.sessionId) {
    suggestions.value = []
    error.value = ''
    return
  }

  loading.value = true
  error.value = ''

  try {
    const payload = await getSessionOptimization(props.sessionId)
    suggestions.value = payload.suggestions as SuggestionWithNodes[]
  } catch (fetchError) {
    suggestions.value = []
    error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load optimization suggestions.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.sessionId,
  () => {
    void loadSuggestions()
  },
  { immediate: true },
)
</script>
