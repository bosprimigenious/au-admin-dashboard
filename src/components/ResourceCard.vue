<template>
  <article
    class="glass-card relative group cursor-pointer overflow-hidden border border-slate-800/60 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/25 hover:shadow-[0_0_40px_rgba(34,211,238,0.08)]"
    :class="selected ? 'ring-1 ring-cyan-300/30' : ''"
    @click="$emit('select', resource.id)"
  >
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent opacity-0 transition group-hover:opacity-100" />

    <div class="relative flex items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.28em] text-cyan-300/70">{{ resource.type }}</p>
        <h3 class="text-xl font-semibold text-slate-100">{{ resource.name }}</h3>
      </div>
      <ResourceStatusDot :status="resource.status" />
    </div>

    <p class="mt-4 min-h-[48px] text-sm leading-6 text-slate-400">{{ resource.description }}</p>

    <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
      <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Model</p>
        <p class="mt-2 text-slate-200">{{ resource.model }}</p>
      </div>
      <div class="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3">
        <p class="text-xs uppercase tracking-[0.22em] text-slate-500">Version</p>
        <p class="mt-2 text-slate-200">{{ resource.version }}</p>
      </div>
    </div>

    <div v-if="resource.tags.length" class="mt-5 flex flex-wrap gap-2">
      <span
        v-for="tag in resource.tags.slice(0, 3)"
        :key="tag"
        class="rounded-full border border-slate-700/70 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300"
      >
        {{ tag }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import ResourceStatusDot from './ResourceStatusDot.vue'
import type { ResourceRecord } from '../types/admin'

defineProps<{
  resource: ResourceRecord
  selected?: boolean
}>()

defineEmits<{
  select: [id: string]
}>()
</script>
