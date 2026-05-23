import * as echarts from 'echarts'
import { onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

import type { GuardrailScores } from '../types/admin'

const DEFAULT_SCORES: GuardrailScores = {
  logic_consistency: 35,
  info_entropy: 20,
  diversity_ttr: 15,
  lpp_feature: 25,
  safety_score: 30,
}

export const useSafetyRadar = (chartRef: Ref<HTMLElement | null>, scores: Ref<GuardrailScores | null>) => {
  let chart: ReturnType<typeof echarts.init> | null = null

  const onResize = () => chart?.resize()

  const renderChart = (nextScores: GuardrailScores) => {
    if (!chartRef.value) {
      return
    }

    const values = [
      nextScores.logic_consistency,
      nextScores.info_entropy,
      nextScores.diversity_ttr,
      nextScores.lpp_feature,
      nextScores.safety_score,
    ]
    const color = nextScores.safety_score >= 75 ? '#10b981' : nextScores.safety_score >= 60 ? '#f59e0b' : '#ef4444'

    if (!chart) {
      chart = echarts.init(chartRef.value, 'dark', { renderer: 'svg' })
      window.addEventListener('resize', onResize)
    }

    chart.setOption({
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
              value: values,
              name: 'Current Agent Output',
              itemStyle: { color },
              areaStyle: { color: `${color}4D` },
              lineStyle: { width: 2, shadowBlur: 10, shadowColor: color },
            },
          ],
        },
      ],
    })
  }

  watch(
    scores,
    (nextScores) => {
      renderChart(nextScores ?? DEFAULT_SCORES)
    },
    { immediate: true, deep: true },
  )

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    chart?.dispose()
    chart = null
  })
}
