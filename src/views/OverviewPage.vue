<template>
  <section>
    <OverviewCards />

    <div class="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
      <div class="xl:col-span-2 space-y-8">
        <ComponentStatusChart :items="statusItems" />
        <RecentCallsList :calls="recentCalls" :loading="monitoringLoading" />
      </div>
      <div class="space-y-8">
        <SafetyRadarPanel :diagnostics="null" />
        <div class="glass-card">
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Trace Preview</p>
          <h3 class="mt-3 text-lg font-semibold text-slate-100">Session topology & optimization</h3>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            Inspect execution graphs, timeline steps, and rule-driven optimization suggestions per session.
          </p>
          <RouterLink
            :to="`/trace/${appStore.selectedAgentId}`"
            class="mt-6 inline-flex w-fit rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-300/15"
          >
            Go to Agent Topology Trace
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import ComponentStatusChart from '../components/ComponentStatusChart.vue'
import OverviewCards from '../components/OverviewCards.vue'
import RecentCallsList from '../components/RecentCallsList.vue'
import SafetyRadarPanel from '../components/SafetyRadarPanel.vue'
import { useAppStore } from '../store/appStore'
import { useMonitoringStore } from '../store/monitoringStore'
import { useResourceStore } from '../store/resourceStore'

const appStore = useAppStore()
const resourceStore = useResourceStore()
const monitoringStore = useMonitoringStore()

const { counts } = storeToRefs(resourceStore)
const { loading: monitoringLoading, recentCalls } = storeToRefs(monitoringStore)

const statusItems = computed(() => [
  { name: 'Agents', value: counts.value.agent },
  { name: 'Tools', value: counts.value.tool },
  { name: 'Knowledge', value: counts.value.knowledge },
  { name: 'Workflows', value: counts.value.workflow },
  { name: 'LLMs', value: counts.value.llm },
  { name: 'Memories', value: counts.value.memory },
])

onMounted(async () => {
  await Promise.all([resourceStore.ensureLoaded(), monitoringStore.fetchMetrics()])
})
</script>
