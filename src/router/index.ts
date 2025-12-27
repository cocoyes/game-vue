import { createRouter, createWebHistory } from 'vue-router'
import ActivityView from '../views/ActivityView.vue'
import MyView from '../views/MyView.vue'
import DetailView from '../views/DetailView.vue'
import MarketDetailView from '../views/MarketDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/activity'
    },
    {
      path: '/activity',
      name: 'activity',
      component: ActivityView
    },
    {
      path: '/my',
      name: 'my',
      component: MyView
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailView
    },
    {
      path: '/market/:id',
      name: 'market',
      component: MarketDetailView
    },
    {
      path: '/seatMap/:id',
      name: 'seatMap',
      component: () => import('../views/SeatMapMapboxView.vue')
    }
  ]
})

export default router
