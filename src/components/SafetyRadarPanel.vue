<template>
  <div class="h-full min-h-[380px] glass-card flex flex-col">
    <div class="mb-6 flex items-center justify-between">
      <h3 class="text-lg font-medium text-slate-200">LPP Safety Diagnostics</h3>
      <span class="rounded-md border px-2 py-1 text-xs" :class="badgeClass">
        {{ badgeLabel }}
      </span>
    </div>

    <div v-if="loading" class="flex flex-1 items-center justify-center text-sm text-slate-500">
      Evaluating guardrail signals...
    </div>

    <template v-else>
      <div ref="chartRef" class="min-h-[280px] w-full flex-1" />

      <div v-if="primaryWarning" class="mt-4 rounded-xl border p-4" :class="warningClass(primaryWarning.level)">
        <p class="text-xs leading-relaxed">
          <strong class="font-bold uppercase tracking-[0.18em]">{{ primaryWarning.level }}</strong>
          {{ primaryWarning.message }}
        </p>
      </div>

      <div v-else-if="!diagnostics" class="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/50 p-4">
        <p class="text-xs leading-relaxed text-slate-400">
          Open Agent Topology Trace and select a session to evaluate guardrail diagnostics for that execution chain.
        </p>
      </div>

      <div v-else class="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <p class="text-xs leading-relaxed text-emerald-300">
          Guardrail checks passed for the current session. No critical structural anomalies detected.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSafetyRadar } from '../hooks/useSafetyRadar'
import type { GuardrailDiagnostics, MonitoringAlert } from '../types/admin'

const props = withDefaults(
  defineProps<{
    diagnostics?: GuardrailDiagnostics | null
    loading?: boolean
  }>(),
  {
    diagnostics: null,
    loading: false,
  },
)

const chartRef = ref<HTMLElement | null>(null)
const scores = computed(() => props.diagnostics?.scores ?? null)

useSafetyRadar(chartRef, scores)

const badgeLabel = computed(() => {
  if (props.loading) {
    return 'Analyzing'
  }
  if (!props.diagnostics) {
    return 'Awaiting Session'
  }
  if (!props.diagnostics.guardrail_enabled) {
    return 'Guardrail OFF'
  }
  return `Risk ${props.diagnostics.risk_level.toUpperCase()}`
})

const badgeClass = computed(() => {
  const level = props.diagnostics?.risk_level ?? 'low'
  switch (level) {
    case 'high':
      return 'border-red-500/30 bg-red-500/10 text-red-300'
    case 'medium':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    default:
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  }
})

const primaryWarning = computed(() => {
  const warnings = props.diagnostics?.warnings ?? []
  return warnings.find((warning) => warning.level !== 'info') ?? warnings[0] ?? null
})

const warningClass = (level: MonitoringAlert['level']) => {
  switch (level) {
    case 'critical':
      return 'border-red-500/20 bg-red-500/10 text-red-300'
    case 'warning':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-200'
    default:
      return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100'
  }
}
</script>
