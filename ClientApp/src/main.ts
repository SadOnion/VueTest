import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueNativeSock from 'vue-native-websocket'

Vue.config.productionTip = false

Vue.use(VueNativeSock, 'ws://localhost:9090', { store })

new Vue({
	router,
	store,
	render: h => h(App),
}).$mount('#app')
