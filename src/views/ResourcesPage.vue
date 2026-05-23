<template>
  <section class="space-y-6">
    <div class="glass-card overflow-hidden">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Resource Matrix</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-100">Operational asset grid for live agent resources</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            This page loads agents, tools, knowledge bases, and workflows from the Phase 1 admin APIs. It is the first
            business-closed view in the dashboard and the foundation for trace, monitoring, and control-plane workflows.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm xl:min-w-[300px]">
          <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Loaded</p>
            <p class="mt-2 text-2xl font-semibold text-slate-100">{{ counts.all }}</p>
          </div>
          <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Updated</p>
            <p class="mt-2 text-sm text-slate-200">{{ lastUpdatedAt || 'Pending first sync' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in resourceFilterOptions"
            :key="option.value"
            type="button"
            class="rounded-xl border px-4 py-2 text-sm transition"
            :class="
              activeFilter === option.value
                ? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-200'
                : 'border-slate-800/70 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            "
            @click="resourceStore.setFilter(option.value)"
          >
            {{ option.label }} ({{ counts[option.value] }})
          </button>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <label class="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3">
            <span class="text-xs uppercase tracking-[0.22em] text-slate-500">Search</span>
            <input
              :value="searchQuery"
              type="text"
              placeholder="Find by name, model, tag..."
              class="w-56 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
              @input="resourceStore.setSearchQuery(($event.target as HTMLInputElement).value)"
            />
          </label>
          <button
            type="button"
            class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
            @click="resourceStore.fetchResources()"
          >
            Refresh Matrix
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard v-for="index in 6" :key="index" />
      </div>
      <SkeletonCard />
    </div>

    <div v-else-if="error" class="space-y-4">
      <EmptyState
        title="Resource sync failed"
        :description="`The resource endpoints did not return usable data. ${error}`"
        action-label="Retry Sync"
        @action="resourceStore.fetchResources()"
      />
    </div>

    <div
      v-else-if="!paginatedResources.length"
      class="space-y-4"
    >
      <EmptyState
        title="No Resources Found"
        description="There are no resources matching the current filter. Try clearing the search or loading a different resource type."
        action-label="Reset Filters"
        @action="resetFilters"
      />
    </div>

    <div v-else class="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ResourceCard
          v-for="resource in paginatedResources"
          :key="resource.id"
          :resource="resource"
          :selected="selectedResource?.id === resource.id"
          @select="handleSelect"
        />
      </div>

      <aside class="glass-card h-fit">
        <div v-if="selectedResource" class="space-y-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Focused Resource</p>
              <h3 class="mt-2 text-xl font-semibold text-slate-100">{{ selectedResource.name }}</h3>
            </div>
            <ResourceStatusDot :status="selectedResource.status" />
          </div>

          <p class="text-sm leading-6 text-slate-400">{{ selectedResource.description }}</p>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Owner</p>
              <p class="mt-2 text-slate-200">{{ selectedResource.owner }}</p>
            </div>
            <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Updated</p>
              <p class="mt-2 text-slate-200">{{ selectedResource.updatedAt }}</p>
            </div>
            <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Model</p>
              <p class="mt-2 text-slate-200">{{ selectedResource.model }}</p>
            </div>
            <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Version</p>
              <p class="mt-2 text-slate-200">{{ selectedResource.version }}</p>
            </div>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Tags</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="tag in selectedResource.tags.length ? selectedResource.tags : ['No Tags']"
                :key="tag"
                class="rounded-full border border-slate-700/70 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="glass-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-sm text-slate-400">
        Showing {{ paginatedResources.length }} of {{ filteredResources.length }} filtered resources
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-2 text-sm text-slate-300 transition disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="currentPage === 1"
          @click="resourceStore.previousPage()"
        >
          Previous
        </button>
        <span class="text-sm text-slate-300">Page {{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-2 text-sm text-slate-300 transition disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="currentPage === totalPages"
          @click="resourceStore.nextPage()"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import EmptyState from '../components/EmptyState.vue'
import ResourceCard from '../components/ResourceCard.vue'
import ResourceStatusDot from '../components/ResourceStatusDot.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import { useAppStore } from '../store/appStore'
import { resourceFilterOptions, useResourceStore } from '../store/resourceStore'

const resourceStore = useResourceStore()
const appStore = useAppStore()

const {
  activeFilter,
  counts,
  currentPage,
  error,
  filteredResources,
  lastUpdatedAt,
  loading,
  paginatedResources,
  searchQuery,
  selectedResource,
  totalPages,
} = storeToRefs(resourceStore)

const resetFilters = () => {
  resourceStore.setFilter('all')
  resourceStore.setSearchQuery('')
}

const handleSelect = (id: string) => {
  resourceStore.selectResource(id)
  appStore.setSelectedAgentId(id)
}

onMounted(async () => {
  await resourceStore.ensureLoaded()
  if (selectedResource.value) {
    appStore.setSelectedAgentId(selectedResource.value.id)
  }
})
</script>
