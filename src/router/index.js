import { createRouter, createWebHistory } from 'vue-router'
import OverwritePostForm from '@/components/OverwritePostForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'overwrite',
      component: OverwritePostForm,
    },
  ],
})

export default router
