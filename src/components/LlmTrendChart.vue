<template>
  <div class="glass-card h-full min-h-[360px]">
    <div class="mb-4 flex items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-medium text-slate-200">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 text-xs text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="loading" class="text-xs text-cyan-300/80">Refreshing...</span>
        <ChartExportButton file-name="llm-trend" :get-data-url="getChartDataUrl" :disabled="!series.length" />
      </div>
    </div>

    <div v-if="loading" class="flex h-[320px] items-center justify-center text-sm text-slate-500">
      Loading trend data...
    </div>
    <div v-else-if="!series.length" class="flex h-[320px] items-center justify-center text-sm text-slate-500">
      {{ emptyMessage }}
    </div>
    <div v-else ref="chartRef" class="h-[320px]" />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'

import ChartExportButton from './ChartExportButton.vue'
import type { MetricPoint } from '../types/admin'

type ChartExportFormat = 'png' | 'svg'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    series: MetricPoint[]
    loading?: boolean
    emptyMessage?: string
  }>(),
  {
    title: 'LLM Activity Trend',
    subtitle: 'Calls and estimated token usage by day',
    loading: false,
    emptyMessage: 'No metrics available for the selected window.',
  },
)

const chartRef: Ref<HTMLElement | null> = ref(null)
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

const renderChart = (series: MetricPoint[]) => {
  if (!chartRef.value || !series.length) {
    destroyChart()
    return
  }

  if (!chart) {
    chart = echarts.init(chartRef.value, 'dark', { renderer: 'svg' })
    window.addEventListener('resize', onResize)
  }

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Calls', 'Tokens'],
      textStyle: { color: '#94a3b8' },
    },
    grid: { left: 48, right: 24, top: 48, bottom: 32 },
    xAxis: {
      type: 'category',
      data: series.map((point) => point.ts),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Calls',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.12)' } },
      },
      {
        type: 'value',
        name: 'Tokens',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Calls',
        type: 'bar',
        data: series.map((point) => point.calls),
        itemStyle: { color: '#22d3ee' },
      },
      {
        name: 'Tokens',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: series.map((point) => point.tokens),
        itemStyle: { color: '#34d399' },
        lineStyle: { width: 2 },
      },
    ],
  })
}

watch(
  () => props.series,
  (series) => {
    if (!series.length) {
      destroyChart()
      return
    }

    void nextTick(() => {
      renderChart(series)
    })
  },
  { immediate: true, deep: true },
)

onBeforeUnmount(() => {
  destroyChart()
})
</script>
