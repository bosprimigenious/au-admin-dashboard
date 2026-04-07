<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
    <div
      v-for="item in stats"
      :key="item.label"
      class="relative group overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 backdrop-blur-md transition-all hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
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
          Active
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'

type Summary = {
  total_agents: number
  total_tools: number
  total_knowledge: number
  total_workflows: number
  system_health: string
}

const stats = ref<
  {
    label: string
    value: number | string
  }[]
>([
  { label: 'Total Agents', value: '—' },
  { label: 'Active Tools', value: '—' },
  { label: 'Knowledge Bases', value: '—' },
  { label: 'Workflows', value: '—' },
])

const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

onMounted(async () => {
  try {
    const { data } = await axios.get<{ success: boolean; result: Summary }>(
      `${apiBase}/api/v1/admin/resources/summary`,
    )
    if (!data.success || !data.result) return
    const r = data.result
    stats.value = [
      { label: 'Total Agents', value: r.total_agents },
      { label: 'Active Tools', value: r.total_tools },
      { label: 'Knowledge Bases', value: r.total_knowledge },
      { label: 'Workflows', value: r.total_workflows },
    ]
  } catch {
    stats.value = [
      { label: 'Total Agents', value: 0 },
      { label: 'Active Tools', value: 0 },
      { label: 'Knowledge Bases', value: 0 },
      { label: 'Workflows', value: 0 },
    ]
  }
})
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
