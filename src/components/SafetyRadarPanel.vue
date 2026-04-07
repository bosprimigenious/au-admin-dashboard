<template>
  <div
    class="h-full min-h-[380px] rounded-2xl bg-slate-900/60 border border-slate-800/50 p-6 backdrop-blur-lg flex flex-col"
  >
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement | null>(null)
let chart: ReturnType<typeof echarts.init> | null = null

const onResize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value, 'dark', { renderer: 'svg' })

  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Logic Consistency', max: 100 },
        { name: 'Info Entropy', max: 100 },
        { name: 'Diversity (TTR)', max: 100 },
        { name: 'LPP Feature', max: 100 },
        { name: 'Safety Score', max: 100 },
      ],
      splitArea: { areaStyle: { color: ['transparent'] } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [90, 85, 40, 30, 88],
            name: 'Current Agent Output',
            itemStyle: { color: '#10b981' },
            areaStyle: { color: 'rgba(16, 185, 129, 0.3)' },
            lineStyle: { width: 2, shadowBlur: 10, shadowColor: '#10b981' },
          },
        ],
      },
    ],
  }
  chart.setOption(option)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>
