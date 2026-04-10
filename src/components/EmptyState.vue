<template>
  <div class="glass-card min-h-[280px] flex flex-col items-center justify-center text-center">
    <div class="mb-5 h-18 w-18 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/8 flex items-center justify-center">
      <div class="h-12 w-12 rounded-[1.5rem] border border-cyan-300/25 bg-gradient-to-br from-cyan-300/20 to-emerald-400/10" />
    </div>
    <h3 class="text-lg font-medium text-slate-100">{{ title }}</h3>
    <p class="mt-2 max-w-md text-sm leading-6 text-slate-400">{{ description }}</p>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/15"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>
