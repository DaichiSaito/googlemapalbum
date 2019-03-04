import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import VueLazyLoad from 'vue-lazyload'
import 'vuetify/dist/vuetify.min.css'
import 'vue-image-lightbox/dist/vue-image-lightbox.min.css'
import VueAnalytics from 'vue-analytics'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(VueLazyLoad)
Vue.use(VueAnalytics, {
  id: 'UA-106801865-6',
  router
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
