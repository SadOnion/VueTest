import Vue, { VueConstructor } from 'vue'
import CarbonComponentsVue from '@carbon/vue/src/index'
import VueSignalR from '@apavelm/vue-signalr'

import App from './App.vue'
import router from './router'
import store from './store'

// Vue.use(VueSignalR, 'localhost:5000/net')

Vue.config.productionTip = false

Vue.use(CarbonComponentsVue)

interface VueWithSocket {
	$socket: any
}

new (Vue as VueConstructor<Vue & VueWithSocket>)({
	router,
	store,
	render: h => h(App),

	// created() {
	// 	this.$socket.start({
	// 		log: process.env.NODE_ENV !== 'production', // Active only in development for debugging.
	// 	})

	// 	console.log(this.$socket)
	// },
}).$mount('#app')
