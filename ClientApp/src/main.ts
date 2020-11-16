import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'
import CarbonComponentsVue from '@carbon/vue/src/index'
// import 'carbon-components/css/carbon-components.css'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(CarbonComponentsVue)
// Vue.use(VueNativeSock, 'ws://localhost:5000/ws', { store })

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
