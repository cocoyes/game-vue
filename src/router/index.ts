import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/lobby'
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/chess',
      name: 'chess',
      component: () => import('../views/ChessGameView.vue')
    }
  ]
})

export default router
