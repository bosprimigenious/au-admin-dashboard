import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { getAllResources } from '../api/admin'
import type { ResourceFilterOption, ResourceKind, ResourceRecord } from '../types/admin'

const PAGE_SIZE = 6

export const resourceFilterOptions: ResourceFilterOption[] = [
  { label: 'All Resources', value: 'all' },
  { label: 'Agents', value: 'agent' },
  { label: 'Tools', value: 'tool' },
  { label: 'Knowledge', value: 'knowledge' },
  { label: 'Workflows', value: 'workflow' },
  { label: 'LLMs', value: 'llm' },
  { label: 'Memories', value: 'memory' },
]

export const useResourceStore = defineStore('resource', () => {
  const resources = ref<ResourceRecord[]>([])
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref('')
  const activeFilter = ref<ResourceKind | 'all'>('all')
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(PAGE_SIZE)
  const selectedResourceId = ref('')
  const lastUpdatedAt = ref('')

  const filteredResources = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return resources.value.filter((resource) => {
      const matchesType = activeFilter.value === 'all' || resource.type === activeFilter.value
      const matchesQuery =
        !query ||
        resource.name.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.model.toLowerCase().includes(query) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(query))

      return matchesType && matchesQuery
    })
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredResources.value.length / pageSize.value)))

  const paginatedResources = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredResources.value.slice(start, start + pageSize.value)
  })

  const selectedResource = computed(
    () =>
      resources.value.find((resource) => resource.id === selectedResourceId.value) ??
      paginatedResources.value[0] ??
      null,
  )

  const counts = computed(() => ({
    all: resources.value.length,
    agent: resources.value.filter((item) => item.type === 'agent').length,
    tool: resources.value.filter((item) => item.type === 'tool').length,
    knowledge: resources.value.filter((item) => item.type === 'knowledge').length,
    workflow: resources.value.filter((item) => item.type === 'workflow').length,
    llm: resources.value.filter((item) => item.type === 'llm').length,
    memory: resources.value.filter((item) => item.type === 'memory').length,
  }))

  const syncPageBounds = () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  }

  const syncSelection = (records: ResourceRecord[]) => {
    const stillSelected = records.some((resource) => resource.id === selectedResourceId.value)
    if (stillSelected) {
      return
    }

    selectedResourceId.value =
      records.find((resource) => resource.type === 'agent')?.id ?? records[0]?.id ?? ''
  }

  watch(filteredResources, () => {
    syncPageBounds()
  })

  const fetchResources = async () => {
    loading.value = true
    error.value = ''

    try {
      const records = await getAllResources()
      resources.value = records
      initialized.value = true
      lastUpdatedAt.value = new Date().toLocaleString()
      syncSelection(records)
      syncPageBounds()
    } catch (fetchError) {
      error.value = fetchError instanceof Error ? fetchError.message : 'Failed to load resources'
    } finally {
      loading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (!initialized.value && !loading.value) {
      await fetchResources()
    }
  }

  const setFilter = (value: ResourceKind | 'all') => {
    activeFilter.value = value
    currentPage.value = 1
  }

  const setSearchQuery = (value: string) => {
    searchQuery.value = value
    currentPage.value = 1
  }

  const selectResource = (id: string) => {
    selectedResourceId.value = id
  }

  const nextPage = () => {
    currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
  }

  const previousPage = () => {
    currentPage.value = Math.max(1, currentPage.value - 1)
  }

  return {
    resources,
    loading,
    error,
    activeFilter,
    searchQuery,
    currentPage,
    pageSize,
    lastUpdatedAt,
    filteredResources,
    paginatedResources,
    totalPages,
    selectedResource,
    counts,
    fetchResources,
    ensureLoaded,
    setFilter,
    setSearchQuery,
    selectResource,
    nextPage,
    previousPage,
  }
})
