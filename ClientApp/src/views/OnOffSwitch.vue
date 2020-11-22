<template>
	<div class="switch">
		<div class="notification-wrapper">
			<cv-toast-notification
				v-if="notification"
				title="New Player!"
				:caption="notification"
				@close="notification = ''"
				class="notification"
			></cv-toast-notification>
		</div>

		<div class="button">
			<cv-button
				:kind="state ? 'primary' : 'secondary'"
				@click="buttonClick"
				>{{ state ? 'ON' : 'OFF' }}</cv-button
			>
		</div>

		<div class="info-tabs-wrapper">
			<cv-tabs aria-label="navigation tab label" class="info-tabs">
				<cv-tab label="Logs" class="tab">
					<cv-list class="logs">
						<cv-list-item v-for="(log, index) in logs" :key="index"
							>{{ log.name || 'Somebody' }}
							<span class="on" v-if="log.state">enabled</span
							><span class="off" v-else>disabled</span> the
							button.</cv-list-item
						>
					</cv-list>
				</cv-tab>
				<cv-tab label="Players" class="tab">
					<cv-list class="players">
						<cv-list-item v-for="player in players" :key="player">{{
							player
						}}</cv-list-item>
					</cv-list>
				</cv-tab>
			</cv-tabs>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import VueSignalR from '@apavelm/vue-signalr'
const goby = require('goby').init()

Vue.use(VueSignalR, `${process.env.VUE_APP_SIGNALR_BASE || ''}/switch`)

interface SwitchLog {
	name: string
	state: boolean
}

export default Vue.extend({
	name: 'WebSocketTest',
	data() {
		return {
			name: goby.generate(['pre', 'suf']) as string,
			notification: '',
			state: false,
			logs: [] as SwitchLog[],
			players: ['You'] as string[],
		}
	},
	methods: {
		buttonClick() {
			this.state = !this.state
			this.$socket.send('changeState', this.state)
		},
	},
	created() {
		this.$socket
			.start({
				log: process.env.NODE_ENV !== 'production', // Active only in development for debugging.
			})
			.send('setName', this.name)
	},
	sockets: {
		initialData(players: string[], state: boolean) {
			this.players.push(...players)
			this.state = state || false
		},
		returnName(name: string) {
			this.name = name
		},
		playerJoined(name: string) {
			this.notification = `${name} has joined us in this battle...`
			this.players.push(name)
		},
		playerDisconnected(name: string) {
			const index = this.players.findIndex(player => player === name)
			this.players.splice(index, 1)
		},
		switchStateChanged(state: boolean, name: string) {
			this.state = state
			this.logs.push({
				name,
				state,
			})
		},
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

.info-tabs {
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
	width: 60vmin !important;
	.tab {
		// background: $gray-90;
		margin-top: $spacing-03;
	}
}

.logs {
	// > li {
	// 	margin-bottom: $spacing-02;
	// }
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
