<template>
  <div class="inline-flex items-center gap-1 rounded-lg border border-slate-800/70 bg-slate-950/60 p-1">
    <button
      v-for="format in formats"
      :key="format"
      type="button"
      class="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800/70 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="disabled || exporting === format"
      :title="`Export ${format.toUpperCase()}`"
      :aria-label="`Export ${format.toUpperCase()}`"
      @click="exportChart(format)"
    >
      <Download class="h-3.5 w-3.5" />
      {{ format.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'

type ChartExportFormat = 'png' | 'svg'

const props = withDefaults(
  defineProps<{
    fileName: string
    getDataUrl: (format: ChartExportFormat) => string | Promise<string>
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const formats: ChartExportFormat[] = ['png', 'svg']
const exporting = ref<ChartExportFormat | null>(null)

const exportChart = async (format: ChartExportFormat) => {
  exporting.value = format
  try {
    const dataUrl = await props.getDataUrl(format)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${props.fileName}.${format}`
    link.click()
  } finally {
    exporting.value = null
  }
}
</script>
