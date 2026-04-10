import axios from 'axios'
import type { AxiosError } from 'axios'

type ApiEnvelope<T> = {
  success: boolean
  result: T
  message?: string | null
  request_id?: string | null
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const emitHttpError = (status: number, message: string) => {
  window.dispatchEvent(new CustomEvent('app:http-error', { detail: { status, message } }))
}

export const request = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
})

export const httpGet = <T>(url: string) => request.get<T, T>(url)

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Requested-With'] = 'XMLHttpRequest'
  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiEnvelope<unknown>
    if (payload && typeof payload.success === 'boolean') {
      if (!payload.success) {
        emitHttpError(response.status, payload.message || 'Business error')
        const error = new Error(payload.message || 'Business error')
        throw error
      }
      return payload.result
    }
    return response.data
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const message =
      typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data
        ? String(error.response.data.message)
        : error.message

    if (status === 401) {
      emitHttpError(status, message || 'Unauthorized')
    } else if (status) {
      emitHttpError(status, message || (status >= 500 ? 'Server unavailable' : 'Request failed'))
    } else {
      emitHttpError(0, message || 'Network unavailable')
    }

    return Promise.reject(error)
  },
)
