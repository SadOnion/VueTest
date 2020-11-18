import Vue from 'vue'
import CarbonComponentsVue from '@carbon/vue/src/index'
import VueNativeSock from 'vue-native-websocket'

import App from './App.vue'
import router from './router'
import store from './store'

// Vue.use(VueNativeSock, process.env.VUE_APP_WEBSOCKET, {
// 	reconnection: true,
// 	reconnectionAttempts: 5,
// 	reconnectionDelay: 3000,
// 	store,
// 	format: 'json',
// })

Vue.config.productionTip = false

Vue.use(CarbonComponentsVue)

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
