import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { useAppStore } from './store/appStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.errorHandler = (error) => {
  const appStore = useAppStore()
  appStore.showToast(`运行时异常: ${error instanceof Error ? error.message : 'Unknown error'}`)
}

window.addEventListener('unhandledrejection', (event) => {
  const appStore = useAppStore()
  appStore.showToast(`未处理 Promise 异常: ${String(event.reason)}`)
})

window.addEventListener('app:http-error', (event: Event) => {
  const customEvent = event as CustomEvent<{ status: number; message: string }>
  const appStore = useAppStore()
  appStore.showToast(`HTTP ${customEvent.detail.status}: ${customEvent.detail.message}`)
})

app.mount('#app')
