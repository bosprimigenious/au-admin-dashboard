<template>
  <div class="glass-card min-h-[320px]">
    <div class="mb-5 flex items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">System Health</p>
        <h3 class="mt-2 text-lg font-semibold text-slate-100">{{ healthLabel }}</h3>
      </div>
      <span class="rounded-md border px-2 py-1 text-xs font-medium" :class="badgeClass">{{ boundedHealth }}</span>
    </div>

    <div ref="chartRef" class="h-[220px] w-full" />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  health: number
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: ReturnType<typeof echarts.init> | null = null

const boundedHealth = computed(() => Math.min(100, Math.max(0, Math.round(props.health))))

const healthColor = computed(() => {
  if (boundedHealth.value >= 80) return '#10b981'
  if (boundedHealth.value >= 50) return '#f59e0b'
  return '#ef4444'
})

const healthLabel = computed(() => {
  if (boundedHealth.value >= 80) return 'Healthy'
  if (boundedHealth.value >= 50) return 'Degraded'
  return 'Needs Attention'
})

const badgeClass = computed(() => {
  if (boundedHealth.value >= 80) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
  if (boundedHealth.value >= 50) return 'border-amber-500/30 bg-amber-500/10 text-amber-300'
  return 'border-red-500/30 bg-red-500/10 text-red-300'
})

const onResize = () => chart?.resize()

const renderChart = () => {
  if (!chartRef.value) return

  if (!chart) {
    chart = echarts.init(chartRef.value, 'dark', { renderer: 'svg' })
    window.addEventListener('resize', onResize)
  }

  chart.setOption({
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 100,
        radius: '96%',
        startAngle: 210,
        endAngle: -30,
        progress: {
          show: true,
          width: 14,
          itemStyle: { color: healthColor.value },
        },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [
              [0.5, '#ef4444'],
              [0.8, '#f59e0b'],
              [1, '#10b981'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { length: 8, lineStyle: { color: 'rgba(226,232,240,0.35)', width: 1 } },
        axisLabel: { color: '#94a3b8', distance: 18, fontSize: 10 },
        pointer: {
          length: '58%',
          width: 4,
          itemStyle: { color: healthColor.value },
        },
        anchor: {
          show: true,
          size: 8,
          itemStyle: { color: healthColor.value },
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: '#f8fafc',
          fontSize: 30,
          offsetCenter: [0, '55%'],
        },
        title: { show: false },
        data: [{ value: boundedHealth.value }],
      },
    ],
  })
}

watch(boundedHealth, renderChart, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>
