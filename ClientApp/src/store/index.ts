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
			ws: null as null | WebSocket,
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
		SET_SOCKET(state, ws: WebSocket) {
			state.socket.ws = ws
		},
		SOCKET_ONOPEN(state, event) {
			console.log('Websocket successfully connected')
			Vue.prototype.$socket = event.currentTarget
			state.socket.isConnected = true
		},
		SOCKET_ONCLOSE(state, event) {
			console.log('Websocket connection closed')
			const { ws } = state.socket
			if (ws) ws.onclose = ws.onopen = ws.onmessage = null
			state.socket.isConnected = false
		},
		SOCKET_ONERROR(state, event) {
			console.error(state, event)
		},
		SOCKET_ONMESSAGE(state, { data }) {
			console.log('store received message:', data)

			state.socket.message =
				typeof data === 'string' ? data : JSON.stringify(data)

			if (typeof data === 'string') data = JSON.parse(data)
			const { header, state: switchState } = data

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
		initWebSocket({ state, commit }) {
			console.log('connecting...')
			const ws = new WebSocket(process.env.VUE_APP_WEBSOCKET)

			ws.onopen = e => commit('SOCKET_ONOPEN', e)
			ws.onmessage = e => commit('SOCKET_ONMESSAGE', e)
			ws.onclose = e => commit('SOCKET_ONCLOSE', e)

			commit('SET_SOCKET', ws)
		},
		buttonSwitch({ state }) {
			state.switch.state = !state.switch.state
			if (state.socket.ws) {
				state.socket.ws.send(`${state.switch.state}`)
			}
		},
		sendMessage({ state }, message) {
			if (!state.socket.ws) {
				console.log(
					"Couldn't send the message due to the connection being closed!",
				)
				return
			}
			state.socket.ws.send(JSON.stringify(message))
		},
	},
})
