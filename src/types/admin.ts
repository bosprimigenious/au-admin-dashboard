export interface DashboardSummary {
  total_agents: number
  total_tools: number
  total_knowledge: number
  total_workflows: number
  system_health: string
}

export interface SessionRecord {
  id: string
  name: string
  description: string
  component_type: string
  status: string
  diagnostics?: Record<string, unknown> | null
}

export type ResourceKind = 'agent' | 'tool' | 'knowledge' | 'workflow'

export type ResourceStatus = 'running' | 'idle' | 'warning' | 'error' | 'draft' | 'unknown'

export interface ResourceRecord {
  id: string
  name: string
  type: ResourceKind
  status: ResourceStatus
  description: string
  model: string
  version: string
  owner: string
  updatedAt: string
  tags: string[]
}

export interface ResourceFilterOption {
  label: string
  value: ResourceKind | 'all'
}

export interface TraceNode {
  id: string
  label: string
  status: 'ok' | 'warning' | 'error'
}

export interface TracePayload {
  agentId: string
  nodes: TraceNode[]
}
