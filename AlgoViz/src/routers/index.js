import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuickSortView from '../views/QuickSortView.vue'
import BellmanShortestPath from '../views/BellmanShortPath.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'Home - Algorithm Visualizer' }
  },
  {
    path: '/sorting',
    name: 'Sorting',
    component: QuickSortView,
    meta: { title: 'Sorting Algorithms - Algorithm Visualizer' }
  },
{
     path: '/shortest-path',
     name: 'ShortestPath',
     component: BellmanShortestPath,
     meta: { title: 'Shortest Path - Algorithm Visualizer' }
   },
  //  {
  //    path: '/coloring',
  //    name: 'Coloring',
  //    component: Coloring,
  //    meta: { title: 'Graph Coloring - Algorithm Visualizer' }
  //  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Algorithm Visualizer'
  next()
})

export default router