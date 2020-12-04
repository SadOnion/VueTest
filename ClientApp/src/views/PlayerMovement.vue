<template>
	<div class="player-movement">
		<div class="player" :style="{ '--angle': angle + 'deg' }"></div>
		<MovementCursor @movement="handlePlayerInput" />
		<ul class="log">
			<li>force: {{ force }}</li>
			<li>angle: {{ angle }}</li>
			<li>sin: {{ sin }}</li>
			<li>top: {{ top }}</li>
			<li>left: {{ left }}</li>
		</ul>
		<div
			class="goal-ball"
			:style="{ '--x': left + 'px', '--y': top + 'px' }"
		></div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import MovementCursor from '@/components/MovementCursor.vue'
import { MovementPayload } from '@/types'

export default Vue.extend({
	name: 'PlayerMovement',
	components: {
		MovementCursor,
	},
	data() {
		return {
			angle: 0,
			force: 0,
			left: 0,
			top: 0,
			sin: 0,
		}
	},
	methods: {
		handlePlayerInput(payload: MovementPayload) {
			const { angle, force, sin } = payload
			this.angle = angle
			this.force = force
			this.sin = sin

			let d = 200 * force,
				x = sin * d,
				y = (d ** 2 - x ** 2) ** (1 / 2)

			if (angle > 270) {
				x *= -1
				y *= -1
			} else if (angle > 180) x *= -1
			else if (angle < 90) y *= -1

			this.left = x
			this.top = y
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
	left: calc(50% - #{$layout-03}/ 2);
	top: calc(50% - #{$layout-04}/ 2);
	width: $layout-03;
	height: $layout-04;
	background: $white-0;
	clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
	transform: rotate(var(--angle, 0));
}

.log {
	position: fixed;
	top: 48px + 20px;
	left: 20px;
	height: 100px;
}

.goal-ball {
	position: fixed;
	z-index: 1000;
	top: calc(50% - 5px);
	left: calc(50% - 5px);
	width: 10px;
	height: 10px;
	background: red;
	border-radius: 50%;
	transform: translate(var(--x, 0), var(--y, 0));
}
</style>
