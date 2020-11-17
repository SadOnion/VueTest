<template>
	<div class="switch">
		<div class="button">
			<cv-button
				:kind="switchState ? 'primary' : 'secondary'"
				@click="buttonClick"
				>{{ switchState ? 'ON' : 'OFF' }}</cv-button
			>
		</div>
		<div class="logs-wrapper">
			<ul class="logs">
				<h4 class="title">Logs</h4>
				<li v-for="(log, index) in switchLogs" :key="index">
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
import { mapState, mapGetters } from 'vuex'

export default Vue.extend({
	name: 'WebSocketTest',
	data() {
		return {
			notification: '',
		}
	},
	computed: {
		...mapState(['switch']),
		...mapGetters(['switchState', 'switchLogs']),
	},
	methods: {
		buttonClick() {
			;(this as any)?.$socket.send(`${!this.switch.state}`)

			// this.$socket.dispatch('sendMessage', this.message)
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
