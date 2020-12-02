<template>
	<div class="player-movement">
		<div class="player"></div>
		<MovementCursor @movement="handlePlayerInput" />
		<ul class="log">
			<li>move: {{ move }}</li>
			<li>angle: {{ angle }}</li>
		</ul>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import MovementCursor from '@/components/MovementCursor.vue'
export default Vue.extend({
	name: 'PlayerMovement',
	components: {
		MovementCursor,
	},
	data() {
		return {
			angle: 0,
			move: 0,
		}
	},
	methods: {
		handlePlayerInput({ angle, move }) {
			this.angle = angle
			this.move = move
		},
	},
})
</script>

<style lang="scss" scoped>
@import '@carbon/colors/scss/colors';
@import '@carbon/layout/scss/layout';
@import '../styles/mixins';

.player {
	position: fixed;
	left: 50%;
	top: 50%;
	width: $layout-03;
	height: $layout-04;
	background: $white-0;
	clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.log {
	position: fixed;
	top: 48px + 20px;
	left: 20px;
	height: 100px;
}
</style>
