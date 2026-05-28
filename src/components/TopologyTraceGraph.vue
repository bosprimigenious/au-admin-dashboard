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
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="relative block w-full md:max-w-xs">
          <span class="sr-only">Search nodes</span>
          <input
            v-model="searchTerm"
            type="search"
            class="w-full rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-cyan-300/40"
            placeholder="Search node name"
          />
        </label>
        <div class="flex flex-wrap gap-3 text-xs text-slate-400">
          <span class="inline-flex items-center gap-2">
            <span class="h-2 w-5 rounded-full bg-red-400" />
            Failed Nodes
          </span>
          <span class="inline-flex items-center gap-2">
            <span class="h-1 w-6 rounded-full bg-cyan-300" />
            Critical Path
          </span>
        </div>
        <ChartExportButton
          file-name="topology-trace"
          :get-data-url="getGraphDataUrl"
          :disabled="!trace?.nodes.length"
        />
      </div>

      <div ref="graphRef" class="flex-1 min-h-[320px] rounded-xl border border-slate-800/70 bg-slate-950/40" />

      <ul v-if="!graphReady" class="space-y-3 overflow-auto">
        <li
          v-for="node in trace.nodes"
          :key="node.id"
          class="flex items-center justify-between rounded-lg border bg-slate-900/50 px-3 py-2 text-sm"
          :class="fallbackNodeClass(node)"
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
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import ChartExportButton from './ChartExportButton.vue'
import type { TraceEdge, TraceNode, TraceNodeStatus, TraceResponse } from '../types/admin'

type ChartExportFormat = 'png' | 'svg'

const emit = defineEmits<{
  'node-select': [nodeId: string]
}>()

const props = withDefaults(
  defineProps<{
    trace: TraceResponse | null
    loading?: boolean
    emptyMessage?: string
    activeNodeId?: string
  }>(),
  {
    loading: false,
    emptyMessage: 'Select a session to inspect its execution topology.',
  },
)

const graphRef = ref<HTMLDivElement | null>(null)
const graphReady = ref(false)
const searchTerm = ref('')
let graph: Graph | null = null

const normalizedSearch = computed(() => searchTerm.value.trim().toLowerCase())

const matchesSearch = (node: TraceNode) => {
  if (!normalizedSearch.value) return false
  return node.name.toLowerCase().includes(normalizedSearch.value)
}

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

const fallbackNodeClass = (node: TraceNode) => {
  if (props.activeNodeId === node.id) {
    return 'border-amber-300/70 bg-amber-300/10 shadow-[0_0_18px_rgba(251,191,36,0.18)]'
  }
  if (matchesSearch(node)) {
    return 'border-cyan-300/60 shadow-[0_0_18px_rgba(34,211,238,0.18)]'
  }
  if (node.status === 'failed') {
    return 'border-red-400/70'
  }
  return 'border-slate-800/50'
}

const findCriticalPath = (nodes: TraceNode[], edges: TraceEdge[]) => {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const outgoing = new Map<string, TraceEdge[]>()
  const indegree = new Map(nodes.map((node) => [node.id, 0]))

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge])
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  }

  const queue = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id)
  const scores = new Map(nodes.map((node) => [node.id, node.duration]))
  const previous = new Map<string, string>()
  const ordered: string[] = []

  while (queue.length) {
    const nodeId = queue.shift()
    if (!nodeId) continue
    ordered.push(nodeId)

    for (const edge of outgoing.get(nodeId) ?? []) {
      const nextNode = nodeMap.get(edge.target)
      if (!nextNode) continue

      const nextScore = (scores.get(nodeId) ?? 0) + nextNode.duration
      if (nextScore > (scores.get(edge.target) ?? 0)) {
        scores.set(edge.target, nextScore)
        previous.set(edge.target, nodeId)
      }

      indegree.set(edge.target, (indegree.get(edge.target) ?? 0) - 1)
      if ((indegree.get(edge.target) ?? 0) === 0) {
        queue.push(edge.target)
      }
    }
  }

  if (!ordered.length) return new Set<string>()

  let tail = ordered.reduce((best, nodeId) => ((scores.get(nodeId) ?? 0) > (scores.get(best) ?? 0) ? nodeId : best))
  const criticalEdges = new Set<string>()

  while (previous.has(tail)) {
    const source = previous.get(tail)
    if (!source) break
    criticalEdges.add(`${source}->${tail}`)
    tail = source
  }

  return criticalEdges
}

const destroyGraph = () => {
  graph?.destroy()
  graph = null
  graphReady.value = false
}

const getGraphDataUrl = async (format: ChartExportFormat) => {
  const exporter = graph as unknown as {
    toDataURL?: (options?: { type?: string; backgroundColor?: string }) => string | Promise<string>
  }
  if (!exporter?.toDataURL) return ''
  return exporter.toDataURL({
    type: format === 'svg' ? 'image/svg+xml' : 'image/png',
    backgroundColor: '#020617',
  })
}

const renderGraph = async (trace: TraceResponse) => {
  if (!graphRef.value || !trace.nodes.length) {
    destroyGraph()
    return
  }

  const width = graphRef.value.clientWidth || 640
  const height = Math.max(graphRef.value.clientHeight, 320)
  const criticalEdges = findCriticalPath(trace.nodes, trace.edges)

  const data = {
    nodes: trace.nodes.map((node) => ({
      id: node.id,
      data: {
        label: node.name,
        status: node.status,
        type: node.type,
        searchMatch: matchesSearch(node),
        active: props.activeNodeId === node.id,
      },
    })),
    edges: trace.edges.map((edge) => ({
      id: `${edge.source}->${edge.target}`,
      source: edge.source,
      target: edge.target,
      data: {
        label: edge.label ?? '',
        critical: criticalEdges.has(`${edge.source}->${edge.target}`),
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
            stroke: (datum) => {
              if (datum.data?.active) return '#fbbf24'
              if (datum.data?.searchMatch) return '#22d3ee'
              if (datum.data?.status === 'failed') return '#f87171'
              return '#334155'
            },
            lineWidth: (datum) =>
              datum.data?.active || datum.data?.status === 'failed' || datum.data?.searchMatch ? 3 : 1,
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
            stroke: (datum) => (datum.data?.critical ? '#22d3ee' : '#64748b'),
            lineWidth: (datum) => (datum.data?.critical ? 3 : 1),
            endArrow: true,
          },
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
        autoFit: 'view',
      })
      graph.on('node:click', (event: unknown) => {
        const nodeId = (event as { target?: { id?: string } }).target?.id
        if (nodeId) {
          emit('node-select', nodeId)
        }
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
  () => [props.trace, normalizedSearch.value, props.activeNodeId] as const,
  ([trace]) => {
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
