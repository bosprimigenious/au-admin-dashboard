<template>
  <div class="h-full min-h-[400px] glass-card flex flex-col">
    <div class="mb-4 flex items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-medium text-slate-200">Execution Topology Trace</h3>
        <p v-if="trace" class="mt-1 text-xs text-slate-500">
          Session {{ trace.session_id }} · {{ trace.nodes.length }} nodes
        </p>
      </div>
      <span v-if="loading" class="text-xs text-cyan-300/80">Loading trace...</span>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center text-slate-500 text-sm">
      Building topology graph...
    </div>

    <div v-else-if="!trace?.nodes.length" class="flex-1 flex items-center justify-center text-center px-6">
      <p class="text-sm text-slate-500">
        {{ emptyMessage }}
      </p>
    </div>

    <div v-else class="flex-1 min-h-[360px] flex flex-col gap-4">
      <div ref="graphRef" class="flex-1 min-h-[320px] rounded-xl border border-slate-800/70 bg-slate-950/40" />

      <ul v-if="!graphReady" class="space-y-3 overflow-auto">
        <li
          v-for="node in trace.nodes"
          :key="node.id"
          class="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-900/50 px-3 py-2 text-sm"
        >
          <div>
            <p class="text-slate-200">{{ node.name }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ node.type }} · {{ node.duration.toFixed(0) }} ms</p>
          </div>
          <span class="rounded-md px-2 py-1 text-xs" :class="statusClass(node.status)">
            {{ node.status }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Graph } from '@antv/g6'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import type { TraceNodeStatus, TraceResponse } from '../types/admin'

const props = withDefaults(
  defineProps<{
    trace: TraceResponse | null
    loading?: boolean
    emptyMessage?: string
  }>(),
  {
    loading: false,
    emptyMessage: 'Select a session to inspect its execution topology.',
  },
)

const graphRef = ref<HTMLDivElement | null>(null)
const graphReady = ref(false)
let graph: Graph | null = null

const statusClass = (status: TraceNodeStatus) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-500/20 text-emerald-300'
    case 'failed':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-amber-500/20 text-amber-300'
  }
}

const nodeFill = (status: TraceNodeStatus) => {
  switch (status) {
    case 'success':
      return '#065f46'
    case 'failed':
      return '#7f1d1d'
    default:
      return '#78350f'
  }
}

const destroyGraph = () => {
  graph?.destroy()
  graph = null
  graphReady.value = false
}

const renderGraph = async (trace: TraceResponse) => {
  if (!graphRef.value || !trace.nodes.length) {
    destroyGraph()
    return
  }

  const width = graphRef.value.clientWidth || 640
  const height = Math.max(graphRef.value.clientHeight, 320)

  const data = {
    nodes: trace.nodes.map((node) => ({
      id: node.id,
      data: {
        label: node.name,
        status: node.status,
        type: node.type,
      },
    })),
    edges: trace.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      data: {
        label: edge.label ?? '',
      },
    })),
  }

  try {
    if (!graph) {
      graph = new Graph({
        container: graphRef.value,
        width,
        height,
        data,
        layout: {
          type: 'dagre',
          rankdir: 'TB',
          nodesep: 36,
          ranksep: 48,
        },
        node: {
          type: 'rect',
          style: {
            size: [180, 40],
            radius: 8,
            fill: (datum) => nodeFill((datum.data?.status as TraceNodeStatus) ?? 'running'),
            stroke: '#334155',
            labelText: (datum) => String(datum.data?.label ?? datum.id),
            labelFill: '#e2e8f0',
            labelFontSize: 11,
            labelMaxWidth: 160,
            labelWordWrap: true,
          },
        },
        edge: {
          type: 'line',
          style: {
            stroke: '#64748b',
            endArrow: true,
          },
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
        autoFit: 'view',
      })
      await graph.render()
    } else {
      graph.setSize(width, height)
      await graph.setData(data)
      await graph.render()
    }

    graphReady.value = true
  } catch {
    destroyGraph()
    graphReady.value = false
  }
}

watch(
  () => props.trace,
  (trace) => {
    if (!trace?.nodes.length) {
      destroyGraph()
      return
    }

    void nextTick(() => {
      void renderGraph(trace)
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  destroyGraph()
})
</script>
