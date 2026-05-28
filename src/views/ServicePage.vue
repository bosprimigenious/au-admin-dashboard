<template>
  <section class="space-y-6">
    <div class="glass-card">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Service Management</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-100">Control-plane services</h2>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Service definitions are mocked from existing LLM and tool resources until the backend service registry is
            available.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm sm:min-w-[320px]">
          <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Services</p>
            <p class="mt-2 text-2xl font-semibold text-slate-100">{{ services.length }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Ready</p>
            <p class="mt-2 text-2xl font-semibold text-slate-100">{{ readyCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
      <div class="space-y-6">
        <div class="glass-card">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              type="button"
              class="rounded-xl border px-4 py-2 text-sm transition"
              :class="
                activeFilter === option.value
                  ? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-200'
                  : 'border-slate-800/70 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              "
              @click="activeFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div v-if="!services.length" class="glass-card">
          <p class="text-sm text-slate-500">No service candidates are available from the current resource set.</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <button
            v-for="service in filteredServices"
            :key="service.id"
            type="button"
            class="rounded-xl border p-4 text-left transition"
            :class="
              selectedService?.id === service.id
                ? 'border-cyan-300/30 bg-cyan-300/10'
                : 'border-slate-800/70 bg-slate-950/60 hover:border-slate-700'
            "
            @click="selectedServiceId = service.id"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-slate-500">{{ service.protocol }}</p>
                <h3 class="mt-2 text-lg font-semibold text-slate-100">{{ service.name }}</h3>
              </div>
              <span class="rounded-md px-2 py-1 text-xs" :class="statusClass(service.status)">
                {{ service.status }}
              </span>
            </div>
            <p class="mt-3 text-sm text-slate-400">{{ service.address }}</p>
            <p class="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{{ service.resourceType }}</p>
          </button>
        </div>
      </div>

      <div class="space-y-6">
        <div class="glass-card">
          <h3 class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Service Detail</h3>

          <div v-if="selectedService" class="mt-4 space-y-5">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-cyan-300/70">Address</p>
              <p class="mt-2 break-all text-sm text-slate-200">{{ selectedService.address }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Call Pattern</p>
                <p class="mt-2 text-slate-200">{{ selectedService.callPattern }}</p>
              </div>
              <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Auth</p>
                <p class="mt-2 text-slate-200">{{ selectedService.auth }}</p>
              </div>
              <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Timeout</p>
                <p class="mt-2 text-slate-200">{{ selectedService.timeoutMs }} ms</p>
              </div>
              <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Retries</p>
                <p class="mt-2 text-slate-200">{{ selectedService.retries }}</p>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-2 text-sm text-slate-300"
                disabled
              >
                Start
              </button>
              <button
                type="button"
                class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-2 text-sm text-slate-300"
                disabled
              >
                Stop
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="glass-card">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">QPS</p>
            <p class="mt-2 text-3xl font-semibold text-slate-100">{{ qps.toFixed(1) }}</p>
          </div>
          <div class="glass-card">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Error Rate</p>
            <p class="mt-2 text-3xl font-semibold text-slate-100">{{ errorRate.toFixed(1) }}%</p>
          </div>
          <div class="glass-card">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">P95 Latency</p>
            <p class="mt-2 text-3xl font-semibold text-slate-100">{{ p95LatencyMs }} ms</p>
          </div>
        </div>

        <div class="glass-card">
          <h3 class="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Implementation Notes</h3>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            TODO: replace mocked addresses, auth metadata, and control actions once the service registry API is
            available.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'

import { useResourceStore } from '../store/resourceStore'
import type { ResourceKind, ResourceRecord, ResourceStatus } from '../types/admin'

interface ServiceRecord {
  id: string
  name: string
  resourceType: ResourceKind
  protocol: string
  status: ResourceStatus
  address: string
  callPattern: string
  auth: string
  timeoutMs: number
  retries: number
}

const resourceStore = useResourceStore()
const { resources } = storeToRefs(resourceStore)
const activeFilter = ref<ResourceKind | 'all'>('all')
const selectedServiceId = ref('')

const filterOptions: { label: string; value: ResourceKind | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'LLMs', value: 'llm' },
  { label: 'Tools', value: 'tool' },
]

const serviceSource = computed(() => resources.value.filter((resource) => resource.type === 'llm' || resource.type === 'tool'))

const services = computed<ServiceRecord[]>(() =>
  serviceSource.value.map((resource, index) => serviceFromResource(resource, index)),
)

const filteredServices = computed(() =>
  activeFilter.value === 'all' ? services.value : services.value.filter((service) => service.resourceType === activeFilter.value),
)

const selectedService = computed(() =>
  filteredServices.value.find((service) => service.id === selectedServiceId.value) ?? filteredServices.value[0] ?? null,
)

const readyCount = computed(() => services.value.filter((service) => service.status === 'running').length)
const qps = computed(() => Math.max(1, services.value.length * 2.4))
const errorRate = computed(() => Math.min(12, services.value.filter((service) => service.status === 'error').length * 1.7))
const p95LatencyMs = computed(() => Math.max(180, 280 - services.value.length * 8))

const statusClass = (status: ResourceStatus) => {
  switch (status) {
    case 'running':
      return 'bg-emerald-500/20 text-emerald-300'
    case 'warning':
      return 'bg-amber-500/20 text-amber-300'
    case 'error':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-slate-500/20 text-slate-300'
  }
}

const serviceFromResource = (resource: ResourceRecord, index: number): ServiceRecord => ({
  id: resource.id,
  name: resource.name,
  resourceType: resource.type,
  protocol: resource.type === 'llm' ? 'HTTP / SSE' : 'MCP / HTTP',
  status: resource.status,
  address:
    resource.type === 'llm'
      ? `http://127.0.0.1:8000/api/v1/llm/${resource.id}`
      : `http://127.0.0.1:8000/api/v1/tools/${resource.id}`,
  callPattern: resource.type === 'llm' ? 'Async completion' : 'Tool invocation',
  auth: index % 2 === 0 ? 'Bearer token' : 'Inline secret',
  timeoutMs: 3000 + index * 250,
  retries: 2,
})

watchEffect(() => {
  if (!selectedServiceId.value && filteredServices.value.length) {
    selectedServiceId.value = filteredServices.value[0].id
  }
})
</script>
