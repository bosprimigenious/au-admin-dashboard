<template>
  <section class="space-y-6">
    <div class="glass-card">
      <h2 class="text-lg text-slate-100 font-medium">Trace Detail</h2>
      <p class="text-sm text-slate-400 mt-2">当前 Agent: {{ route.params.id }}</p>
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2 min-h-[420px]">
        <TopologyTraceGraph />
      </div>
      <div class="xl:col-span-1 min-h-[420px]">
        <SafetyRadarPanel />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import TopologyTraceGraph from '../components/TopologyTraceGraph.vue'
import SafetyRadarPanel from '../components/SafetyRadarPanel.vue'

const route = useRoute()
</script>
