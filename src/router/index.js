import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserListView from '../views/UserListView.vue'
import RoleListView from '../views/RoleListView.vue'
import EquipmentListView from '../views/EquipmentListView.vue'
import AlertListView from '../views/AlertListView.vue'
import BorrowRecordListView from '../views/BorrowRecordListView.vue'
import SensorDataView from '../views/SensorDataView.vue'
import AnalyticsUsageView from '../views/analytics/UsageView.vue'
import AnalyticsRankingView from '../views/analytics/RankingView.vue'
import AnalyticsAlertsView from '../views/analytics/AlertsView.vue'
import AnalyticsTrendsView from '../views/analytics/TrendsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/users',
      name: 'users',
      component: UserListView
    },
    {
      path: '/roles',
      name: 'roles',
      component: RoleListView
    },
    {
      path: '/equipment',
      name: 'equipment',
      component: EquipmentListView
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: AlertListView
    },
    {
      path: '/borrow-records',
      name: 'borrow-records',
      component: BorrowRecordListView
    },
    {
      path: '/sensor-data',
      name: 'sensor-data',
      component: SensorDataView
    },
    {
      path: '/analytics/usage',
      name: 'analytics-usage',
      component: AnalyticsUsageView
    },
    {
      path: '/analytics/ranking',
      name: 'analytics-ranking',
      component: AnalyticsRankingView
    },
    {
      path: '/analytics/alerts',
      name: 'analytics-alerts',
      component: AnalyticsAlertsView
    },
    {
      path: '/analytics/trends',
      name: 'analytics-trends',
      component: AnalyticsTrendsView
    }
  ]
})

export default router