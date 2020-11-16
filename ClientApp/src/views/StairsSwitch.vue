<template>
	<div class="switch">
		<div class="button">
			<cv-button :kind="buttonKind" @click="buttonClick">{{
				on ? 'ON' : 'OFF'
			}}</cv-button>
		</div>
		<div class="logs-wrapper">
			<ul class="logs">
				<h4 class="title">Logs</h4>
				<li v-for="(log, index) in logs" :key="index">
					{{ log.name }} <span class="on" v-if="log.action">enabled</span
					><span class="off" v-else>disabled</span> the button.
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
	name: 'StairsSwitch',
	data() {
		return {
			on: true,
			logs: [
				{
					name: 'Kenny',
					action: true,
				},
				{
					name: 'Ben',
					action: false,
				},
				{
					name: 'Bob',
					action: true,
				},
				{
					name: 'Angry Pirate',
					action: true,
				},
				{
					name: 'Elizabeth',
					action: false,
				},
				{
					name: 'Johnny',
					action: true,
				},
			],
		}
	},
	computed: {
		buttonKind() {
			return this.on ? 'primary' : 'secondary'
		},
	},
	methods: {
		buttonClick() {
			this.on = !this.on
		},
	},
})
</script>

<style lang="scss" scoped>
@import '../styles/carbon/layout';
@import '../styles/carbon/colors';

.switch {
	height: 100vh;
	width: 100vw;
	padding-top: 48px;
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
</style>
