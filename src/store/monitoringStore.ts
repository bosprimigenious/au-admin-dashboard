import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getLlmMetrics } from '../api/admin'
import type { LlmMetricsResponse, MetricPoint, MonitoringAlert } from '../types/admin'

export const useMonitoringStore = defineStore('monitoring', () => {
  const metrics = ref<LlmMetricsResponse | null>(null)
  const loading = ref(false)
  const error = ref('')

  const series = computed<MetricPoint[]>(() => metrics.value?.series ?? [])
  const alerts = computed<MonitoringAlert[]>(() => metrics.value?.alerts ?? [])
  const totalCalls = computed(() => metrics.value?.total_calls ?? 0)
  const totalTokens = computed(() => metrics.value?.total_tokens ?? 0)
  const dataSource = computed(() => metrics.value?.data_source ?? '')
  const p95LatencyMs = computed(() => metrics.value?.p95_latency_ms ?? 0)
  const topCallers = computed(() => metrics.value?.top_callers ?? [])
  const recentCalls = computed(() => metrics.value?.recent_calls ?? [])
  const resourceSnapshot = computed(() => metrics.value?.resource_snapshot ?? null)
  const autoRefreshEnabled = ref(false)
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  const fetchMetrics = async (params?: { start?: string; end?: string }) => {
    loading.value = true
    error.value = ''

    try {
      metrics.value = await getLlmMetrics(params)
    } catch (fetchError) {
      metrics.value = null
      error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load metrics'
    } finally {
      loading.value = false
    }
  }

  const setAutoRefresh = (enabled: boolean, intervalMs = 30000) => {
    autoRefreshEnabled.value = enabled
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    if (enabled) {
      refreshTimer = setInterval(() => {
        void fetchMetrics()
      }, intervalMs)
    }
  }

  return {
    metrics,
    loading,
    error,
    series,
    alerts,
    totalCalls,
    totalTokens,
    dataSource,
    p95LatencyMs,
    topCallers,
    recentCalls,
    resourceSnapshot,
    autoRefreshEnabled,
    fetchMetrics,
    setAutoRefresh,
  }
})
