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
	},
	getters: {
		switchState: state => state.switch.state,
		switchLogs: state => state.switch.logs,
	},
	mutations: {
	},
	actions: {
		
	},
})
