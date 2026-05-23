import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getAuthMe } from '../api/admin'

const STORAGE_KEY = 'admin_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(STORAGE_KEY) ?? import.meta.env.VITE_ADMIN_TOKEN ?? '')
  const role = ref('')
  const authEnabled = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !authEnabled.value || Boolean(token.value.trim()))

  const persistToken = (value: string) => {
    token.value = value.trim()
    if (token.value) {
      localStorage.setItem(STORAGE_KEY, token.value)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const fetchProfile = async () => {
    loading.value = true
    try {
      const profile = await getAuthMe()
      role.value = profile.role
      authEnabled.value = profile.auth_enabled
    } catch {
      role.value = ''
      authEnabled.value = false
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    role,
    authEnabled,
    loading,
    isAuthenticated,
    persistToken,
    fetchProfile,
  }
})
