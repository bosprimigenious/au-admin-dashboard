<template>
  <div class="glass-card h-full min-h-[320px]">
    <div class="mb-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-medium text-slate-200">Component Status</h3>
          <p class="mt-1 text-xs text-slate-500">Registered resource distribution</p>
        </div>
        <ChartExportButton file-name="component-status" :get-data-url="getChartDataUrl" :disabled="!items.length" />
      </div>
    </div>
    <div v-if="!items.length" class="flex h-[260px] items-center justify-center text-sm text-slate-500">
      No resource data loaded yet.
    </div>
    <div v-else ref="chartRef" class="h-[260px]" />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import ChartExportButton from './ChartExportButton.vue'

type ChartExportFormat = 'png' | 'svg'

const props = defineProps<{
  items: { name: string; value: number }[]
}>()

const chartRef = ref<HTMLElement | null>(null)
let chart: ReturnType<typeof echarts.init> | null = null

const onResize = () => chart?.resize()

const destroyChart = () => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
}

const getChartDataUrl = (format: ChartExportFormat) => {
  if (!chart) return ''
  return chart.getDataURL({
    type: format,
    pixelRatio: 2,
    backgroundColor: '#020617',
  })
}

const renderChart = (items: { name: string; value: number }[]) => {
  if (!chartRef.value || !items.length) {
    destroyChart()
    return
  }
  if (!chart) {
    chart = echarts.init(chartRef.value, 'dark', { renderer: 'svg' })
    window.addEventListener('resize', onResize)
  }
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['42%', '70%'],
        data: items.filter((item) => item.value > 0),
        label: { color: '#cbd5e1' },
      },
    ],
  })
}

watch(
  () => props.items,
  (items) => {
    if (!items.length) {
      destroyChart()
      return
    }

    void nextTick(() => {
      renderChart(items)
    })
  },
  { immediate: true, deep: true },
)

onBeforeUnmount(destroyChart)
</script>
