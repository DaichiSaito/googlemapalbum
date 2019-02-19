import Vue from 'vue'
import Router from 'vue-router'
import GMap from './views/GMap.vue'
import CountryDetail from './views/CountryDetail.vue'
import ImageUploadModal from './components/ImageUploadModal.vue'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'gmap',
      component: GMap
    },
    {
      path: '/countries/:id',
      name: 'countryDetail',
      component: CountryDetail,
      children: [{
        path: 'addDocument',
        component: ImageUploadModal,
        name: 'imageUploadModal',
        meta: {
          requiresAuth: true
        }
      }]
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
