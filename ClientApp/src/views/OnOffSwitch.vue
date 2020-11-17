<template>
	<div class="switch">
		<div class="button">
			<cv-button :kind="on ? 'primary' : 'secondary'" @click="buttonClick">{{
				on ? 'ON' : 'OFF'
			}}</cv-button>
		</div>
		<div class="logs-wrapper">
			<ul class="logs">
				<h4 class="title">Logs</h4>
				<li v-for="(log, index) in logs" :key="index">
					{{ log.name }} <span class="on" v-if="log.state">enabled</span
					><span class="off" v-else>disabled</span> the button.
				</li>
			</ul>
		</div>
		<div class="notification-wrapper">
			<cv-toast-notification
				v-if="notification"
				title="New Player!"
				:caption="notification"
				@close="notification = ''"
				class="notification"
			></cv-toast-notification>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
// import { mapState } from 'vuex'
// import VueNativeSock from 'vue-native-websocket'
// import store from '@/store'
// Vue.use(VueNativeSock, process.env.VUE_APP_WEBSOCKET, {
// 	reconnection: true,
// 	reconnectionAttempts: 5,
// 	reconnectionDelay: 3000,
// 	store,
// 	format: 'json',
// })

interface Log {
	name: string
	state: boolean
}

export default Vue.extend({
	name: 'OnOffSwitch',
	data() {
		return {
			on: false,
			logs: [] as Log[],
			notification: 'Kenny has joined us in this war...',
			connection: null as WebSocket | null,
		}
	},
	computed: {
		// ...mapState(['socket', 'switchState']),
	},
	methods: {
		buttonClick() {
			this.on = !this.on
			this.connection?.send(`${this.on}`)
		},
		messageReceived(message: any) {
			if (!message || typeof message !== 'object' || !('data' in message))
				return
			const { header, state } = JSON.parse(message.data)
			if (header === 'SwitchState' && typeof state === 'boolean') {
				this.on = state
				this.logs.push({
					name: 'unknown',
					state,
				})
			}
		},
	},
	mounted() {
		this.connection = new WebSocket(process.env.VUE_APP_WEBSOCKET)

		this.connection.addEventListener('message', this.messageReceived)
	},
	beforeDestroy() {
		console.log(this.$route.name, 'Connection Close')
		this.connection?.close()
	},
})
</script>

<style lang="scss" scoped>
@import '../styles/carbon/layout';
@import '../styles/carbon/colors';
@import '../styles/mixins';

.switch {
	@include full-view-page;
	display: flex;
}
.button {
	margin: auto;
	> button {
		width: 100px;
	}
}
.logs {
	&-wrapper {
		position: fixed;
		top: calc(50% + 100px);
		max-height: calc(50% - 100px);
		left: 0;
		width: 100%;
		display: flex;
		overflow: hidden;
	}
	margin: auto;
	width: 60vmin;
	> li {
		margin-bottom: $spacing-02;
	}
	.title {
		margin-bottom: $spacing-03;
	}
	.on {
		color: $blue-50;
	}
	.off {
		color: $red-50;
	}
}
.notification {
	&-wrapper {
		position: fixed;
		top: 10vh;
		width: 100vw;
		display: flex;
		justify-content: center;
	}
}
</style>
