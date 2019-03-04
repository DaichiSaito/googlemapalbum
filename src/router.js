import Vue from 'vue'
import Router from 'vue-router'
import GMap from './views/GMap.vue'
import CountryDetail from './views/CountryDetail.vue'
import Login from './views/Login.vue'
import Mypage from './views/Mypage.vue'
import ImageUploadModal from './components/ImageUploadModal.vue'
import About from './views/About.vue'
import { auth } from "@/firebase/init";

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'gmap',
      component: GMap
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: Mypage,
      meta: {
        requiresAuth: true
      }
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
  ]
})

router.beforeEach((to, from, next) => {
  // check to see if routes requires auth
  if (to.matched.some(rec => rec.meta.requiresAuth)) {
    // check auth state of user
    let user = auth.currentUser
    if (user) {
      //user signed in, proceed to route
      next()
    } else {
      // no user signed in, redirect to login
      next({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router