import Vue from 'vue'
import CarbonComponentsVue from '@carbon/vue/src/index'
import GlobalEvents from 'vue-global-events'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.component('GlobalEvents', GlobalEvents)

Vue.config.productionTip = false

Vue.use(CarbonComponentsVue)

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
