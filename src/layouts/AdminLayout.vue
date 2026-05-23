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
      <header class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex items-center gap-4">
          <h1 class="text-xl text-slate-100 font-semibold">Admin Dashboard</h1>
          <span class="text-xs px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            System Health: {{ appStore.systemHealth }}
          </span>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span
            v-if="authStore.role"
            class="text-xs uppercase tracking-[0.2em] text-cyan-300/80"
          >
            Role: {{ authStore.role }}
          </span>
          <label class="flex items-center gap-2 text-sm text-slate-400">
            <span class="sr-only">Admin API Token</span>
            <input
              v-model="tokenInput"
              type="password"
              placeholder="Bearer token"
              class="w-52 rounded-lg border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-slate-200 outline-none"
            />
            <button
              type="button"
              class="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100"
              @click="saveToken"
            >
              Save
            </button>
          </label>
        </div>
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
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'

const appStore = useAppStore()
const authStore = useAuthStore()
const tokenInput = ref(authStore.token)

const saveToken = async () => {
  authStore.persistToken(tokenInput.value)
  await authStore.fetchProfile()
}

onMounted(async () => {
  await authStore.fetchProfile()
})
</script>
