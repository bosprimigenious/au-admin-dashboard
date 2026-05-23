import { httpGet } from '../utils/request'
import type {
  AlertsResponse,
  AuthProfile,
  DashboardSummary,
  GuardrailDiagnostics,
  LlmMetricsResponse,
  OptimizationResponse,
  ResourceKind,
  ResourceRecord,
  ResourceStatus,
  SessionRecord,
  TraceResponse,
} from '../types/admin'
interface AdminResourceItemDto {
  id: string
  name: string
  description: string
  component_type: string
  status: string
  diagnostics?: Record<string, unknown> | null
}

interface AdminResourceListDto {
  total: number
  data: AdminResourceItemDto[]
}

interface AdminDashboardSummaryDto {
  total_agents: number
  total_tools: number
  total_knowledge: number
  total_workflows: number
  total_llms?: number
  total_memories?: number
  system_health: string | number
  total_llm_calls_today?: number
  total_tokens_today?: number
}

interface AdminSessionListDto {
  total: number
  data: AdminResourceItemDto[]
}

// These fields are UI placeholders until the backend exposes richer metadata.
const RESOURCE_PLACEHOLDERS = {
  description: 'No description provided.',
  model: 'Not exposed',
  version: 'Phase 1',
  owner: 'System',
  updatedAt: 'Not exposed',
} as const

const mapComponentType = (value: string): ResourceKind => {
  const normalized = value.trim().toUpperCase()

  switch (normalized) {
    case 'AGENT':
      return 'agent'
    case 'TOOL':
      return 'tool'
    case 'KNOWLEDGE':
      return 'knowledge'
    case 'WORKFLOW':
      return 'workflow'
    case 'LLM':
      return 'llm'
    case 'MEMORY':
      return 'memory'
    default:
      throw new Error(`Unsupported component_type: ${normalized || 'unknown'}`)
  }
}

const mapResourceStatus = (value: string): ResourceStatus => {
  switch (value.trim().toUpperCase()) {
    case 'ACTIVE':
      return 'running'
    case 'IDLE':
      return 'idle'
    case 'WARNING':
    case 'DEGRADED':
      return 'warning'
    case 'ERROR':
    case 'FAILED':
      return 'error'
    case 'DRAFT':
    case 'PENDING':
      return 'draft'
    default:
      return 'unknown'
  }
}

export const normalizeSystemHealth = (value: string | number): string => {
  if (typeof value === 'number') {
    if (value >= 80) return 'healthy'
    if (value >= 50) return 'degraded'
    return 'unknown'
  }
  switch (value.trim().toUpperCase()) {
    case 'OK':
      return 'healthy'
    case 'WARNING':
    case 'DEGRADED':
      return 'degraded'
    case '':
      return 'unknown'
    default:
      return value.trim().toLowerCase() || 'unknown'
  }
}

const toResourceRecord = (dto: AdminResourceItemDto): ResourceRecord => ({
  id: dto.id,
  name: dto.name,
  type: mapComponentType(dto.component_type),
  status: mapResourceStatus(dto.status),
  description: dto.description || RESOURCE_PLACEHOLDERS.description,
  model: RESOURCE_PLACEHOLDERS.model,
  version: RESOURCE_PLACEHOLDERS.version,
  owner: RESOURCE_PLACEHOLDERS.owner,
  updatedAt: RESOURCE_PLACEHOLDERS.updatedAt,
  tags: [],
})

const toSessionRecord = (dto: AdminResourceItemDto): SessionRecord => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  component_type: dto.component_type,
  status: dto.status,
  diagnostics: dto.diagnostics,
})

const getResourceList = async (path: string): Promise<ResourceRecord[]> => {
  const payload = await httpGet<AdminResourceListDto>(path)
  return payload.data.map(toResourceRecord)
}

export const getSummary = async (): Promise<DashboardSummary> => {
  const payload = await httpGet<AdminDashboardSummaryDto>('/api/v1/admin/resources/summary')
  return {
    ...payload,
    total_llms: payload.total_llms ?? 0,
    total_memories: payload.total_memories ?? 0,
    total_llm_calls_today: payload.total_llm_calls_today ?? 0,
    total_tokens_today: payload.total_tokens_today ?? 0,
    system_health: normalizeSystemHealth(payload.system_health),
  }
}

export const getAgents = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/agents')

export const getTools = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/tools')

export const getKnowledge = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/knowledge')

export const getWorkflows = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/workflows')

export const getLlms = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/llms')

export const getMemories = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/memories')

export const getAllResources = async (): Promise<ResourceRecord[]> => {
  const [agents, tools, knowledge, workflows, llms, memories] = await Promise.all([
    getAgents(),
    getTools(),
    getKnowledge(),
    getWorkflows(),
    getLlms(),
    getMemories(),
  ])

  return [...agents, ...tools, ...knowledge, ...workflows, ...llms, ...memories]
}

export const getSessions = async (agentId: string): Promise<SessionRecord[]> => {
  const payload = await httpGet<AdminSessionListDto>(`/api/v1/admin/resources/sessions/${agentId}`)
  return payload.data.map(toSessionRecord)
}

export const getSessionTrace = (sessionId: string): Promise<TraceResponse> =>
  httpGet<TraceResponse>(`/api/v1/admin/trace/sessions/${sessionId}`)

export const getSessionGuardrail = (sessionId: string): Promise<GuardrailDiagnostics> =>
  httpGet<GuardrailDiagnostics>(`/api/v1/admin/guardrail/sessions/${sessionId}`)

export const getLlmMetrics = (params?: { start?: string; end?: string }): Promise<LlmMetricsResponse> => {
  const query = new URLSearchParams()
  if (params?.start) query.set('start', params.start)
  if (params?.end) query.set('end', params.end)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return httpGet<LlmMetricsResponse>(`/api/v1/admin/metrics/llm${suffix}`)
}

export const getAuthMe = (): Promise<AuthProfile> => httpGet<AuthProfile>('/api/v1/admin/auth/me')

export const getAlerts = (): Promise<AlertsResponse> => httpGet<AlertsResponse>('/api/v1/admin/alerts')

export const getSessionOptimization = (sessionId: string): Promise<OptimizationResponse> =>
  httpGet<OptimizationResponse>(`/api/v1/admin/optimization/sessions/${sessionId}`)
