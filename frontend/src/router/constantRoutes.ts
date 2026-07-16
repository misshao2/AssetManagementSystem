import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import Login from '@/views/login/index.vue'
import NotFound from '@/views/error/404.vue'
import Dashboard from '@/views/dashboard/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404', hidden: true }
  },
  {
    path: '/',
    component: Layout,
    name: 'Layout',
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '工作台', icon: 'Odometer', affix: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

export default routes
