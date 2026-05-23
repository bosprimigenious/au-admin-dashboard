export interface DashboardSummary {
  total_agents: number
  total_tools: number
  total_knowledge: number
  total_workflows: number
  system_health: string
  total_llm_calls_today: number
  total_tokens_today: number
}

export interface MetricPoint {
  ts: string
  calls: number
  tokens: number
}

export interface MonitoringAlert {
  level: 'info' | 'warning' | 'critical' | string
  message: string
}

export interface LlmMetricsResponse {
  series: MetricPoint[]
  total_calls: number
  total_tokens: number
  alerts: MonitoringAlert[]
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

export type TraceNodeStatus = 'success' | 'failed' | 'running'

export type TraceNodeType = 'agent' | 'tool' | 'llm' | 'message' | 'knowledge' | 'memory' | 'workflow'

export interface TraceNode {
  id: string
  name: string
  type: TraceNodeType
  start_time: string
  end_time: string
  duration: number
  status: TraceNodeStatus
  error?: string | null
}

export interface TraceEdge {
  source: string
  target: string
  label?: string | null
}

export interface TraceResponse {
  session_id: string
  agent_id: string
  nodes: TraceNode[]
  edges: TraceEdge[]
  timeline: TraceNode[]
  diagnostics?: GuardrailDiagnostics | null
}

export interface GuardrailScores {
  logic_consistency: number
  info_entropy: number
  diversity_ttr: number
  lpp_feature: number
  safety_score: number
}

export interface GuardrailDiagnostics {
  guardrail_enabled: boolean
  risk_level: 'low' | 'medium' | 'high' | string
  scores: GuardrailScores
  warnings: MonitoringAlert[]
}
