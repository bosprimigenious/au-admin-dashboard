import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted } from 'vue'
import type { Ref } from 'vue'

export const useSafetyRadar = (chartRef: Ref<HTMLElement | null>) => {
  let chart: ReturnType<typeof echarts.init> | null = null

  const onResize = () => chart?.resize()

  onMounted(() => {
    if (!chartRef.value) return
    chart = echarts.init(chartRef.value, 'dark', { renderer: 'svg' })

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
              value: [90, 85, 40, 30, 88],
              name: 'Current Agent Output',
              itemStyle: { color: '#10b981' },
              areaStyle: { color: 'rgba(16, 185, 129, 0.3)' },
              lineStyle: { width: 2, shadowBlur: 10, shadowColor: '#10b981' },
            },
          ],
        },
      ],
    })

    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    chart?.dispose()
    chart = null
  })
}
