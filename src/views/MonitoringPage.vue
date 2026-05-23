<template>
  <section class="space-y-6">
    <div class="glass-card">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Monitoring Center</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-100">LLM usage and alert stream</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Metrics are aggregated from persisted session messages. Token counts are estimated for dashboard visibility
            until full OpenTelemetry billing hooks are wired in.
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          @click="monitoringStore.fetchMetrics()"
        >
          Refresh Metrics
        </button>
      </div>
    </div>

    <div v-if="error" class="glass-card border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Total Calls</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ totalCalls }}</p>
      </div>
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Total Tokens</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ totalTokens }}</p>
      </div>
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Alerts</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ alerts.length }}</p>
      </div>
    </div>

    <LlmTrendChart :series="series" :loading="loading" />

    <div class="glass-card">
      <h3 class="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Alert Stream</h3>
      <ul v-if="alerts.length" class="space-y-3">
        <li
          v-for="(alert, index) in alerts"
          :key="`${alert.level}-${index}`"
          class="rounded-xl border px-4 py-3 text-sm"
          :class="alertClass(alert.level)"
        >
          <p class="font-medium uppercase tracking-[0.18em]">{{ alert.level }}</p>
          <p class="mt-2 text-slate-300">{{ alert.message }}</p>
        </li>
      </ul>
      <p v-else class="text-sm text-slate-500">No active alerts in the current window.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import LlmTrendChart from '../components/LlmTrendChart.vue'
import { useMonitoringStore } from '../store/monitoringStore'

const monitoringStore = useMonitoringStore()
const { alerts, error, loading, series, totalCalls, totalTokens } = storeToRefs(monitoringStore)

const alertClass = (level: string) => {
  switch (level) {
    case 'critical':
      return 'border-red-500/30 bg-red-500/10 text-red-200'
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
    default:
      return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100'
  }
}

onMounted(async () => {
  await monitoringStore.fetchMetrics()
})
</script>
