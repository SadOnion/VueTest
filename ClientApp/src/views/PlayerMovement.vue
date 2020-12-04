<template>
	<div class="player-movement">
		<div class="player" :style="{ '--angle': angle + 'deg' }"></div>
		<MovementCursor @movement="handlePlayerInput" />
		<ul class="log">
			<li>angle: {{ angle }}</li>
			<li>input: {{ input[0] }}; {{ input[1] }}</li>
			<li>goal: {{ goal[0] }}; {{ goal[1] }}</li>
		</ul>
		<div
			class="goal-ball input"
			:style="{ '--x': input[0] + 'px', '--y': input[1] + 'px' }"
		></div>
		<div
			class="goal-ball goal"
			:style="{ '--x': goal[0] + 'px', '--y': goal[1] + 'px' }"
		></div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import MovementCursor from '@/components/MovementCursor.vue'
import { XY, MovementPayload } from '@/types'
// eslint-disable-next-line import/extensions
import { lerp } from '@/library/utilities.ts'

export default Vue.extend({
	name: 'PlayerMovement',
	components: {
		MovementCursor,
	},
	data() {
		return {
			angle: 0,
			input: [0, 0] as XY,
			goal: [0, 0] as XY,
		}
	},
	methods: {
		handlePlayerInput(payload: MovementPayload) {
			const { angle, force, sin } = payload
			this.angle = angle

			const d = 200 * force || 0
			let x = sin * d || 0,
				y = (d ** 2 - x ** 2) ** (1 / 2) || 0

			if (angle > 270) {
				x *= -1
				y *= -1
			} else if (angle > 180) x *= -1
			else if (angle < 90) y *= -1

			this.input = [x, y]
		},
		everyFrame() {
			this.goal = this.input.map(
				(n, i) => lerp(this.goal[i], n, 0.2) || 0,
			) as XY
		},
	},
	mounted() {
		setInterval(this.everyFrame, 16)
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
	border-radius: 50%;
	transform: translate(var(--x, 0), var(--y, 0));

	&.input {
		background: red;
	}
	&.goal {
		background: greenyellow;
	}
}
</style>
