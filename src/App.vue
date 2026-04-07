<template>
  <div class="min-h-screen flex">
    <aside
      class="w-64 shrink-0 border-r border-slate-800/50 bg-slate-900/50 backdrop-blur-xl p-6 flex flex-col gap-6"
    >
      <div class="flex items-center gap-3 text-emerald-400 font-bold text-xl tracking-tight">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center text-white text-sm"
        >
          aU
        </div>
        Ops Center
      </div>
      <nav class="flex flex-col gap-2 mt-8">
        <a
          href="#"
          class="px-4 py-3 rounded-xl bg-slate-800/80 text-emerald-400 border border-slate-700/50 shadow-inner transition-all"
          >Overview Dashboard</a
        >
        <a
          href="#"
          class="px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >Resource Matrix</a
        >
        <a
          href="#"
          class="px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
          >Agent Topology Trace</a
        >
      </nav>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <OverviewCards />
      <div class="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div class="xl:col-span-2 min-h-[420px]">
          <TopologyTraceGraph />
        </div>
        <div class="xl:col-span-1 min-h-[420px]">
          <SafetyRadarPanel />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import OverviewCards from './components/OverviewCards.vue'
import TopologyTraceGraph from './components/TopologyTraceGraph.vue'
import SafetyRadarPanel from './components/SafetyRadarPanel.vue'
</script>
