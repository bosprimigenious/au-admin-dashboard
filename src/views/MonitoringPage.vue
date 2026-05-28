<template>
  <section class="space-y-6">
    <div class="glass-card">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Monitoring Center</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-100">LLM usage and alert stream</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Metrics prefer OpenTelemetry LLM spans when available; otherwise session messages are used with estimated
            token counts.
          </p>
          <p v-if="dataSource" class="mt-2 text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Source: {{ dataSource }}
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <label class="flex items-center gap-2 text-sm text-slate-400">
            <input v-model="autoRefresh" type="checkbox" class="rounded border-slate-700" @change="toggleAutoRefresh" />
            Auto refresh (30s)
          </label>
          <button
            type="button"
            class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
            @click="monitoringStore.fetchMetrics()"
          >
            Refresh Metrics
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="glass-card border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
      {{ error }}
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Total Calls</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ totalCalls }}</p>
      </div>
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Total Tokens</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ totalTokens }}</p>
      </div>
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">P95 Latency</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ p95LatencyMs.toFixed(0) }} ms</p>
      </div>
      <div class="glass-card">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Alerts</p>
        <p class="mt-2 text-3xl font-semibold text-slate-100">{{ alerts.length }}</p>
      </div>
    </div>

    <div class="glass-card space-y-4">
      <div>
        <h3 class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Alert Notifications</h3>
        <p class="mt-2 text-sm text-slate-500">
          Notification channels are stored locally until a backend configuration endpoint exists.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <label class="space-y-2 text-sm text-slate-400">
          <span class="text-xs uppercase tracking-[0.22em] text-slate-500">Webhook URL</span>
          <input
            v-model="notificationConfig.webhookUrl"
            type="url"
            class="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-slate-200 outline-none"
            placeholder="https://example.com/webhook"
          />
        </label>
        <label class="space-y-2 text-sm text-slate-400">
          <span class="text-xs uppercase tracking-[0.22em] text-slate-500">Email Address</span>
          <input
            v-model="notificationConfig.email"
            type="email"
            class="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-slate-200 outline-none"
            placeholder="alerts@example.com"
          />
        </label>
        <div class="space-y-3 text-sm text-slate-400">
          <span class="text-xs uppercase tracking-[0.22em] text-slate-500">Channels</span>
          <label class="flex items-center gap-2">
            <input v-model="notificationConfig.webhookEnabled" type="checkbox" class="rounded border-slate-700" />
            Webhook
          </label>
          <label class="flex items-center gap-2">
            <input v-model="notificationConfig.emailEnabled" type="checkbox" class="rounded border-slate-700" />
            Email
          </label>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          @click="saveNotificationConfig"
        >
          Save Notification Settings
        </button>
        <p class="text-sm text-emerald-300" :class="saveMessage ? 'opacity-100' : 'opacity-0'">{{ saveMessage }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <LlmTrendChart :series="series" :loading="loading" />
      </div>
      <RecentCallsList :calls="recentCalls" :loading="loading" />
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div class="glass-card">
        <h3 class="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Top Callers</h3>
        <ul v-if="topCallers.length" class="space-y-3">
          <li
            v-for="caller in topCallers"
            :key="caller.name"
            class="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm"
          >
            <span class="text-slate-200">{{ caller.name }}</span>
            <span class="text-cyan-300/80">{{ caller.calls }} calls</span>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">No caller ranking available for this window.</p>
      </div>

      <div class="glass-card">
        <h3 class="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">System Resources</h3>
        <dl v-if="resourceSnapshot" class="grid grid-cols-2 gap-3 text-sm">
          <div v-for="item in resourceRows" :key="item.label">
            <dt class="text-xs uppercase tracking-[0.18em] text-slate-500">{{ item.label }}</dt>
            <dd class="mt-1 text-xl font-semibold text-slate-100">{{ item.value }}</dd>
          </div>
        </dl>
        <p v-else class="text-sm text-slate-500">Resource snapshot unavailable.</p>
      </div>
    </div>

    <div class="glass-card">
      <h3 class="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Alert Stream</h3>
      <ul v-if="alerts.length" class="space-y-3">
        <li
          v-for="(alert, index) in alerts"
          :key="`${alert.level}-${index}`"
          class="rounded-xl border px-4 py-3 text-sm"
          :class="alertClass(alert.level)"
        >
          <p class="font-medium uppercase tracking-[0.18em]">{{ alert.level }}</p>
          <p class="mt-2 text-slate-300">{{ alert.message }}</p>
        </li>
      </ul>
      <p v-else class="text-sm text-slate-500">No active alerts in the current window.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import LlmTrendChart from '../components/LlmTrendChart.vue'
import RecentCallsList from '../components/RecentCallsList.vue'
import { useMonitoringStore } from '../store/monitoringStore'

const monitoringStore = useMonitoringStore()
const {
  alerts,
  dataSource,
  error,
  loading,
  p95LatencyMs,
  recentCalls,
  resourceSnapshot,
  series,
  topCallers,
  totalCalls,
  totalTokens,
} = storeToRefs(monitoringStore)

const autoRefresh = ref(false)
const saveMessage = ref('')
const notificationConfig = ref({
  webhookUrl: '',
  email: '',
  webhookEnabled: true,
  emailEnabled: false,
})

const NOTIFICATION_STORAGE_KEY = 'au-monitoring-notification-config'

const loadNotificationConfig = () => {
  const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY)
  if (!raw) return
  try {
    const parsed = JSON.parse(raw) as typeof notificationConfig.value
    notificationConfig.value = {
      webhookUrl: parsed.webhookUrl ?? '',
      email: parsed.email ?? '',
      webhookEnabled: Boolean(parsed.webhookEnabled),
      emailEnabled: Boolean(parsed.emailEnabled),
    }
  } catch {
    // Ignore malformed local config and keep defaults.
  }
}

const saveNotificationConfig = () => {
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificationConfig.value))
  saveMessage.value = 'Notification settings saved locally.'
  window.setTimeout(() => {
    saveMessage.value = ''
  }, 1800)
}

const resourceRows = computed(() => {
  const snapshot = resourceSnapshot.value
  if (!snapshot) return []
  return [
    { label: 'Agents', value: snapshot.agents },
    { label: 'Tools', value: snapshot.tools },
    { label: 'Knowledge', value: snapshot.knowledge },
    { label: 'Workflows', value: snapshot.workflows },
    { label: 'LLMs', value: snapshot.llms },
    { label: 'Memories', value: snapshot.memories },
  ]
})

const alertClass = (level: string) => {
  switch (level) {
    case 'critical':
      return 'border-red-500/30 bg-red-500/10 text-red-200'
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
    default:
      return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-100'
  }
}

const toggleAutoRefresh = () => {
  monitoringStore.setAutoRefresh(autoRefresh.value)
}

onMounted(async () => {
  loadNotificationConfig()
  await monitoringStore.fetchMetrics()
})

onBeforeUnmount(() => {
  monitoringStore.setAutoRefresh(false)
})
</script>
