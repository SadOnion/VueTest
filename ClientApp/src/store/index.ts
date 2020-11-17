import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

interface SwitchLog {
	name: string
	state: boolean
}

export default new Vuex.Store({
	state: {
		switch: {
			logs: [] as SwitchLog[],
			state: false,
		},
		socket: {
			isConnected: false,
			message: '',
			reconnectError: false,
		},
	},
	getters: {
		switchState: state => state.switch.state,
		switchLogs: state => state.switch.logs,
	},
	mutations: {
		SOCKET_ONOPEN(state, event) {
			console.log('Websocket successfully connected')
			Vue.prototype.$socket = event.currentTarget
			state.socket.isConnected = true
		},
		SOCKET_ONCLOSE(state, event) {
			console.log('Websocket connection closed')
			state.socket.isConnected = false
			console.log(event)
		},
		SOCKET_ONERROR(state, event) {
			console.error(state, event)
		},
		SOCKET_ONMESSAGE(state, message) {
			console.log('store received message:', message)

			state.socket.message =
				typeof message === 'string' ? message : JSON.stringify(message)

			if (typeof message === 'string') message = JSON.parse(message)
			const { header, state: switchState } = message

			if (header === 'SwitchState' && typeof switchState === 'boolean') {
				state.switch.state = switchState
				state.switch.logs.push({
					name: 'Unknown',
					state: switchState,
				})
			}
		},
		SOCKET_RECONNECT(state, count) {
			console.info('Reconnecting... attempt:', count)
		},
		SOCKET_RECONNECT_ERROR(state) {
			state.socket.reconnectError = true
		},
	},
	actions: {
		buttonSwitch({ state }) {
			state.switch.state = !state.switch.state
			Vue.prototype.$socket.send(`${state.switch.state}`)
		},
		sendMessage({ state }, message) {
			if (!state.socket.isConnected) {
				console.log(
					"Couldn't send the message due to the connection being closed!",
				)
				return
			}
			Vue.prototype.$socket.send(message)
		},
	},
})
