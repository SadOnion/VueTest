import Vue from 'vue'
import CarbonComponentsVue from '@carbon/vue/src/index'
import VueSignalR from '@apavelm/vue-signalr'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(VueSignalR, process.env.VUE_APP_SIGNALR_BASE || '' + '/switch')

Vue.config.productionTip = false

Vue.use(CarbonComponentsVue)

new Vue({
	router,
	store,
	render: h => h(App),

	created() {
		this.$socket.start({
			log: process.env.NODE_ENV !== 'production', // Active only in development for debugging.
		})
	},
}).$mount('#app')
