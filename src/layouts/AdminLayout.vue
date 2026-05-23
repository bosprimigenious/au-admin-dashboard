<template>
  <div class="min-h-screen flex">
    <aside class="w-64 shrink-0 app-sidebar">
      <div class="brand-title">
        <div class="brand-icon">aU</div>
        Ops Center
      </div>

      <nav class="flex flex-col gap-2 mt-8">
        <RouterLink to="/overview" class="nav-link" active-class="nav-link-active">Overview Dashboard</RouterLink>
        <RouterLink to="/resources" class="nav-link" active-class="nav-link-active">Resource Matrix</RouterLink>
        <RouterLink to="/monitoring" class="nav-link" active-class="nav-link-active">Monitoring Center</RouterLink>
        <RouterLink :to="`/trace/${appStore.selectedAgentId}`" class="nav-link" active-class="nav-link-active">
          Agent Topology Trace
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <header class="mb-6 flex items-center justify-between">
        <h1 class="text-xl text-slate-100 font-semibold">Admin Dashboard</h1>
        <span class="text-xs px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          System Health: {{ appStore.systemHealth }}
        </span>
      </header>

      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <transition name="fade-slide">
      <div v-if="appStore.toastMessage" class="toast-message">
        {{ appStore.toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAppStore } from '../store/appStore'

const appStore = useAppStore()
</script>
