import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const systemHealth = ref('unknown')
  const globalLoading = ref(false)
  const selectedAgentId = ref('agent-001')
  const toastMessage = ref('')

  const setSystemHealth = (value: string) => {
    systemHealth.value = value
  }

  const setGlobalLoading = (value: boolean) => {
    globalLoading.value = value
  }

  const setSelectedAgentId = (value: string) => {
    selectedAgentId.value = value
  }

  const showToast = (message: string) => {
    toastMessage.value = message
    window.setTimeout(() => {
      toastMessage.value = ''
    }, 2400)
  }

  return {
    systemHealth,
    globalLoading,
    selectedAgentId,
    toastMessage,
    setSystemHealth,
    setGlobalLoading,
    setSelectedAgentId,
    showToast,
  }
})
