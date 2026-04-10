<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
    <div
      v-for="item in stats"
      :key="item.label"
      class="glass-card relative group overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
    >
      <div
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
      />

      <p class="text-slate-400 text-sm font-medium tracking-wider uppercase mb-2">
        {{ item.label }}
      </p>
      <div class="flex items-end justify-between">
        <h3 class="text-4xl font-light text-slate-100">{{ item.value }}</h3>
        <span class="text-emerald-400 text-sm flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Synced
        </span>
      </div>
    </div>

    <div v-if="hasError" class="glass-card col-span-full border-amber-500/40">
      <p class="text-amber-300 text-sm">⚠️ 资源汇总加载失败，请稍后重试。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSummary, normalizeSystemHealth } from '../api/admin'
import { useAppStore } from '../store/appStore'
import type { DashboardSummary } from '../types/admin'

const stats = ref<
  {
    label: string
    value: number | string
  }[]
>([
  { label: 'Total Agents', value: '—' },
  { label: 'Total Tools', value: '—' },
  { label: 'Knowledge Bases', value: '—' },
  { label: 'Workflows', value: '—' },
])
const hasError = ref(false)
const appStore = useAppStore()

const toStats = (r: DashboardSummary) => [
  { label: 'Total Agents', value: r.total_agents },
  { label: 'Total Tools', value: r.total_tools },
  { label: 'Knowledge Bases', value: r.total_knowledge },
  { label: 'Workflows', value: r.total_workflows },
]

const fetchSummary = async () => {
  appStore.setGlobalLoading(true)
  hasError.value = false
  try {
    const summary = await getSummary()
    stats.value = toStats(summary)
    appStore.setSystemHealth(summary.system_health)
  } catch (error) {
    hasError.value = true
    appStore.showToast(`获取资源汇总失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    stats.value = toStats({
      total_agents: 0,
      total_tools: 0,
      total_knowledge: 0,
      total_workflows: 0,
      system_health: 'degraded',
    })
    appStore.setSystemHealth(normalizeSystemHealth('degraded'))
  } finally {
    appStore.setGlobalLoading(false)
  }
}

onMounted(fetchSummary)
</script>
