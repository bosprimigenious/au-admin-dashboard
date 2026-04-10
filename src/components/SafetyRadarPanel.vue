<template>
  <div class="h-full min-h-[380px] glass-card flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-medium text-slate-200">LPP Safety Diagnostics</h3>
      <span
        class="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30"
        >Guardrail ON</span
      >
    </div>

    <div ref="chartRef" class="flex-1 w-full min-h-[280px]" />

    <div class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <p class="text-red-400 text-xs leading-relaxed">
        <strong class="font-bold">Warning:</strong>
        High idiom density and structural particle ratio detected. Possible hallucination or homogenized output in the
        current thought chain.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSafetyRadar } from '../hooks/useSafetyRadar'

const chartRef = ref<HTMLElement | null>(null)
useSafetyRadar(chartRef)
</script>
