import Vue from 'vue'
import VueRouter from 'vue-router'
import MySql from '../views/MySql.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'MySql',
    component: MySql
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
