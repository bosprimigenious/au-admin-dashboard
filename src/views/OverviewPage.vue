<template>
  <section>
    <OverviewCards />
    <div class="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2 min-h-[420px]">
        <div class="glass-card flex h-full min-h-[400px] flex-col justify-center px-8">
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Trace Preview</p>
          <h3 class="mt-3 text-xl font-semibold text-slate-100">Open Agent Topology Trace for session graphs</h3>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Overview focuses on resource health. Session-level execution topology is available on the dedicated trace
            page with G6 rendering and timeline inspection.
          </p>
          <RouterLink
            :to="`/trace/${appStore.selectedAgentId}`"
            class="mt-6 inline-flex w-fit rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-300/15"
          >
            Go to Agent Topology Trace
          </RouterLink>
        </div>
      </div>
      <div class="xl:col-span-1 min-h-[420px]">
        <SafetyRadarPanel :diagnostics="null" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

import OverviewCards from '../components/OverviewCards.vue'
import SafetyRadarPanel from '../components/SafetyRadarPanel.vue'
import { useAppStore } from '../store/appStore'

const appStore = useAppStore()
</script>
