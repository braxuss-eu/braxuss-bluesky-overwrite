import { createRouter, createWebHistory } from 'vue-router'
import OverwritePostForm from '@/views/OverwritePostForm.vue'
import TosView from '@/views/TosView.vue'
import PolicyView from '@/views/PolicyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'overwrite',
      component: OverwritePostForm,
    },
    {
      path: '/tos',
      name: 'tos',
      component: TosView,
    },
    {
      path: '/policy',
      name: 'policy',
      component: PolicyView,
    },
  ],
})

export default router
