import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '../layouts/AdminLayout.vue'
import MonitoringPage from '../views/MonitoringPage.vue'
import OverviewPage from '../views/OverviewPage.vue'
import ResourcesPage from '../views/ResourcesPage.vue'
import TraceDetailPage from '../views/TraceDetailPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/overview' },
        { path: '/overview', component: OverviewPage },
        { path: '/resources', component: ResourcesPage },
        { path: '/trace/:agentId/:sessionId?', component: TraceDetailPage, props: true },
        { path: '/monitoring', component: MonitoringPage },
      ],
    },
  ],
})
