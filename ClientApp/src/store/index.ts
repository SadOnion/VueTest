import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

interface SwitchLog {
	name: string
	state: boolean
}

export default new Vuex.Store({
	state: {
		socket: {
			isConnected: false,
			message: '',
			reconnectError: false,
			switchLogs: [] as SwitchLog[],
		},
		switchState: false,
	},
	mutations: {
		SOCKET_ONOPEN(state, event) {
			Vue.prototype.$socket = event.currentTarget
			state.socket.isConnected = true
		},
		SOCKET_ONCLOSE(state) {
			console.log('Connection Closed')
			state.socket.isConnected = false
		},
		SOCKET_ONERROR(state, event) {
			console.error(state, event)
		},
		// default handler called for all methods
		SOCKET_ONMESSAGE(state, message) {
			console.log('store received message:', message)

			state.socket.message = message

			if (message.Header === 'SwitchState') {
				if (typeof message.state === 'boolean') {
					state.switchState = message.state
				}
				state.socket.switchLogs.push({
					name: 'Unknown',
					state: message.State,
				})
			}
		},
		// mutations for reconnect methods
		SOCKET_RECONNECT(state, count) {
			console.info(state, count)
		},
		SOCKET_RECONNECT_ERROR(state) {
			state.socket.reconnectError = true
		},
	},
	actions: {
		buttonSwitch({ state }) {
			Vue.prototype.$socket.send(`${!state.switchState}`)
		},
	},
})
