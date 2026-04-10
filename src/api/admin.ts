import { httpGet } from '../utils/request'
import type { DashboardSummary, ResourceKind, ResourceRecord, ResourceStatus, SessionRecord, TracePayload } from '../types/admin'

// Backend DTOs mirror the Phase 1 Blueprint contracts directly.
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
  system_health: string
}

interface AdminSessionListDto {
  total: number
  data: SessionRecord[]
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
    default:
      throw new Error(`Unsupported component_type: ${normalized || 'unknown'}`)
  }
}

// Resource status normalization belongs in the API adapter so views only consume UI-safe enums.
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

// System health normalization stays at the transport boundary to keep store/component wording consistent.
export const normalizeSystemHealth = (value: string): string => {
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

const getResourceList = async (path: string): Promise<ResourceRecord[]> => {
  const payload = await httpGet<AdminResourceListDto>(path)
  return payload.data.map(toResourceRecord)
}

export const getSummary = async (): Promise<DashboardSummary> => {
  const payload = await httpGet<AdminDashboardSummaryDto>('/api/v1/admin/resources/summary')
  return {
    ...payload,
    system_health: normalizeSystemHealth(payload.system_health),
  }
}

export const getAgents = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/agents')

export const getTools = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/tools')

export const getKnowledge = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/knowledge')

export const getWorkflows = (): Promise<ResourceRecord[]> => getResourceList('/api/v1/admin/resources/workflows')

export const getSessions = async (agentId: string): Promise<SessionRecord[]> => {
  const payload = await httpGet<AdminSessionListDto>(`/api/v1/admin/resources/sessions/${agentId}`)
  return payload.data
}

export const getTracePayload = async (agentId: string): Promise<TracePayload> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 600)
  })

  return {
    agentId,
    nodes: [
      { id: 'planner', label: 'Planner', status: 'ok' },
      { id: 'tool-router', label: 'Tool Router', status: 'warning' },
      { id: 'safety-check', label: 'Safety Check', status: 'ok' },
      { id: 'finalizer', label: 'Finalizer', status: 'ok' },
    ],
  }
}
