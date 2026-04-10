<template>
  <section>
    <OverviewCards />
    <div class="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
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
import OverviewCards from '../components/OverviewCards.vue'
import TopologyTraceGraph from '../components/TopologyTraceGraph.vue'
import SafetyRadarPanel from '../components/SafetyRadarPanel.vue'
</script>
